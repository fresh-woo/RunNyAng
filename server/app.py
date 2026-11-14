"""RunNyAng ranking API (Flask + SQLite).

Endpoints
  GET  /health                  -> {"status": "ok"}
  GET  /api/rankings?limit=50   -> {"rankings": [...]}
  POST /api/rankings            -> {"entry": {...}, "rank": n, "improved": bool}

Ranking rule: shorter clear time first, then more churu, then earlier record.
One row per nickname; a resubmission only replaces the row when it ranks better.
"""

from __future__ import annotations

import os
import sqlite3
import threading
import time
from datetime import datetime, timezone

from flask import Flask, g, jsonify, request
from flask_cors import CORS

DB_PATH = os.environ.get("RANKING_DB_PATH", os.path.join(os.path.dirname(__file__), "data", "ranking.db"))
ALLOWED_ORIGINS = [
    o.strip()
    for o in os.environ.get(
        "CORS_ORIGINS",
        "https://runnyang.sublumen.xyz,http://localhost:3000,http://127.0.0.1:3000",
    ).split(",")
    if o.strip()
]

NICKNAME_MIN, NICKNAME_MAX = 1, 12
# Stage is 500 m and the top speed is 8 m/s (62.5 s); keep some slack for future tuning.
MIN_TIME_SECONDS = float(os.environ.get("MIN_TIME_SECONDS", "30"))
MAX_TIME_SECONDS = float(os.environ.get("MAX_TIME_SECONDS", "3600"))
MAX_CHURU = int(os.environ.get("MAX_CHURU", "200"))
SUBMIT_COOLDOWN_SECONDS = float(os.environ.get("SUBMIT_COOLDOWN_SECONDS", "3"))
MAX_LIMIT = 100

app = Flask(__name__)
app.config["JSON_AS_ASCII"] = False
app.json.ensure_ascii = False  # type: ignore[attr-defined]
CORS(app, resources={r"/api/*": {"origins": ALLOWED_ORIGINS}})

_last_submit: dict[str, float] = {}
_submit_lock = threading.Lock()


def get_db() -> sqlite3.Connection:
    if "db" not in g:
        conn = sqlite3.connect(DB_PATH, timeout=10)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL")
        g.db = conn
    return g.db


@app.teardown_appcontext
def close_db(_exc):
    conn = g.pop("db", None)
    if conn is not None:
        conn.close()


def init_db() -> None:
    os.makedirs(os.path.dirname(DB_PATH) or ".", exist_ok=True)
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS rankings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nickname TEXT NOT NULL UNIQUE,
                time_seconds REAL NOT NULL,
                churu INTEGER NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )
        conn.execute("CREATE INDEX IF NOT EXISTS idx_rankings_order ON rankings (time_seconds, churu DESC, created_at)")


ORDER_BY = "time_seconds ASC, churu DESC, created_at ASC"


def row_to_dict(row: sqlite3.Row, rank: int) -> dict:
    return {
        "rank": rank,
        "nickname": row["nickname"],
        "timeSeconds": row["time_seconds"],
        "churu": row["churu"],
        "createdAt": row["created_at"],
    }


def rank_of(conn: sqlite3.Connection, time_seconds: float, churu: int, created_at: str) -> int:
    (better,) = conn.execute(
        """
        SELECT COUNT(*) FROM rankings
        WHERE time_seconds < ?
           OR (time_seconds = ? AND churu > ?)
           OR (time_seconds = ? AND churu = ? AND created_at < ?)
        """,
        (time_seconds, time_seconds, churu, time_seconds, churu, created_at),
    ).fetchone()
    return better + 1


def is_better(time_a: float, churu_a: int, time_b: float, churu_b: int) -> bool:
    return time_a < time_b or (time_a == time_b and churu_a > churu_b)


def client_ip() -> str:
    forwarded = request.headers.get("X-Forwarded-For", "")
    return forwarded.split(",")[0].strip() if forwarded else (request.remote_addr or "unknown")


def bad_request(message: str):
    return jsonify({"error": message}), 400


@app.get("/health")
def health():
    return jsonify({"status": "ok"})


@app.get("/api/rankings")
def list_rankings():
    try:
        limit = int(request.args.get("limit", 50))
    except ValueError:
        return bad_request("limit은 숫자여야 합니다.")
    limit = max(1, min(MAX_LIMIT, limit))
    rows = get_db().execute(f"SELECT * FROM rankings ORDER BY {ORDER_BY} LIMIT ?", (limit,)).fetchall()
    return jsonify({"rankings": [row_to_dict(r, i + 1) for i, r in enumerate(rows)]})


@app.post("/api/rankings")
def submit_ranking():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return bad_request("JSON 본문이 필요합니다.")

    nickname = data.get("nickname")
    if not isinstance(nickname, str):
        return bad_request("닉네임을 입력해 주세요.")
    nickname = " ".join(nickname.split())
    if not (NICKNAME_MIN <= len(nickname) <= NICKNAME_MAX):
        return bad_request(f"닉네임은 {NICKNAME_MIN}~{NICKNAME_MAX}자로 입력해 주세요.")

    time_seconds = data.get("timeSeconds")
    churu = data.get("churu")
    if isinstance(time_seconds, bool) or not isinstance(time_seconds, (int, float)):
        return bad_request("timeSeconds가 올바르지 않습니다.")
    if isinstance(churu, bool) or not isinstance(churu, int):
        return bad_request("churu가 올바르지 않습니다.")
    time_seconds = round(float(time_seconds), 1)
    if not (MIN_TIME_SECONDS <= time_seconds <= MAX_TIME_SECONDS):
        return bad_request("기록 시간이 허용 범위를 벗어났습니다.")
    if not (0 <= churu <= MAX_CHURU):
        return bad_request("츄르 개수가 허용 범위를 벗어났습니다.")

    ip = client_ip()
    now = time.monotonic()
    with _submit_lock:
        last = _last_submit.get(ip)
        if last is not None and now - last < SUBMIT_COOLDOWN_SECONDS:
            return jsonify({"error": "잠시 후 다시 시도해 주세요."}), 429
        _last_submit[ip] = now

    conn = get_db()
    created_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
    existing = conn.execute("SELECT * FROM rankings WHERE nickname = ?", (nickname,)).fetchone()

    improved = True
    if existing is None:
        conn.execute(
            "INSERT INTO rankings (nickname, time_seconds, churu, created_at) VALUES (?, ?, ?, ?)",
            (nickname, time_seconds, churu, created_at),
        )
    elif is_better(time_seconds, churu, existing["time_seconds"], existing["churu"]):
        conn.execute(
            "UPDATE rankings SET time_seconds = ?, churu = ?, created_at = ? WHERE id = ?",
            (time_seconds, churu, created_at, existing["id"]),
        )
    else:
        improved = False
    conn.commit()

    row = conn.execute("SELECT * FROM rankings WHERE nickname = ?", (nickname,)).fetchone()
    rank = rank_of(conn, row["time_seconds"], row["churu"], row["created_at"])
    return jsonify({"entry": row_to_dict(row, rank), "rank": rank, "improved": improved}), 201 if improved else 200


init_db()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", "5000")), debug=True)
