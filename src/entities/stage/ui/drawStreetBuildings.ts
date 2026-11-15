import { ROAD_LEFT, ROAD_RIGHT, CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../shared/config/gameConfig';
import { project } from '../lib/projection';
import { STREET_BUILDINGS } from '../model/streetBuildings';
import { StreetBuilding } from '../model/types';

/**
 * 학교 밖 거리 구간(흑석역 앞, 중앙대 병원 앞)의 길가 상가 건물 렌더링
 *
 * 건물 한 채 = 세워진 상자: 카메라를 보는 앞면(세로 모서리가 수직인 사각형) + 위에서 보이는 옥상.
 * - 앞면: fromM 지점 바닥에서 위로 솟음. 1층 유리 가게, 간판, 위층 창문
 * - 옥상: 앞면 윗변에서 다음 건물 바닥(toM)까지, 도로 기울기를 따라 이어짐
 * - 오른쪽 건물은 도로를 향한 옆벽도 보임
 * 먼 건물부터 그려서 가까운 건물이 앞에 서 있게 한다.
 */

/** 도로 가장자리에서 건물 벽까지 인도 폭 (논리 px) */
const SIDEWALK_GAP = 48;
/** 건물이 도로 바깥쪽으로 뻗는 폭 (화면 밖까지) */
const BUILDING_SPAN = 700;

/** 간판 글자가 들어가는 폭 (도로 쪽 끝부터, 논리 px). 왼쪽 화면 여백에 맞춤 */
const TEXT_BOX_W = 168;

/** 플레이어 기준 그릴 범위 (m) */
const VIEW_BEHIND_M = 3;
const VIEW_AHEAD_M = 12;

interface SideEdges {
  inner: number; // 도로 쪽 벽 끝 (논리 x)
  outer: number; // 바깥쪽 벽 끝 (논리 x)
  dir: 1 | -1; // 도로에서 멀어지는 화면 방향
}

const edgesFor = (side: 'LEFT' | 'RIGHT', gap = SIDEWALK_GAP): SideEdges =>
  side === 'LEFT'
    ? { inner: ROAD_LEFT - gap, outer: ROAD_LEFT - gap - BUILDING_SPAN, dir: -1 }
    : { inner: ROAD_RIGHT + gap, outer: ROAD_RIGHT + gap + BUILDING_SPAN, dir: 1 };

/** 병원은 앞 광장만큼 도로에서 물러나 있음 (높은 옥상이 인도 가로수를 덮지 않게) */
const HOSPITAL_SETBACK = 170;
const edgesForBuilding = (b: StreetBuilding): SideEdges =>
  edgesFor(b.side, b.kind === 'HOSPITAL' ? HOSPITAL_SETBACK : SIDEWALK_GAP);

/** 색을 어둡게/밝게 (amt: -1 ~ 1) */
const shade = (hex: string, amt: number): string => {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) =>
    Math.round(Math.max(0, Math.min(255, amt < 0 ? c * (1 + amt) : c + (255 - c) * amt)));
  const r = f((n >> 16) & 255);
  const g = f((n >> 8) & 255);
  const b = f(n & 255);
  return `rgb(${r}, ${g}, ${b})`;
};

/** 앞면 위 좌표계: 도로 쪽 모서리에서 바깥으로 d px, 바닥에서 위로 h px 인 사각형 */
interface Face {
  innerX: number; // 앞면의 도로 쪽 세로 모서리 화면 x
  baseY: number; // 앞면 바닥 화면 y
  height: number; // 앞면 높이 (px)
  dir: 1 | -1;
  scale: number;
}

const faceRect = (
  ctx: CanvasRenderingContext2D,
  f: Face,
  d0: number,
  d1: number,
  h0: number,
  h1: number,
  color: string
) => {
  const xa = f.innerX + f.dir * d0;
  const xb = f.innerX + f.dir * d1;
  const x = Math.min(xa, xb);
  const w = Math.abs(xb - xa);
  const y = f.baseY - h1;
  const h = h1 - h0;
  if (y > CANVAS_HEIGHT || y + h < 0 || x > CANVAS_WIDTH || x + w < 0) return;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
};

/** 간판 글자: 화면에 보이는 간판 폭 안에 맞춰 크기를 줄이고 가운데 정렬 */
const faceText = (
  ctx: CanvasRenderingContext2D,
  f: Face,
  d0: number,
  d1: number,
  h0: number,
  h1: number,
  text: string,
  color: string,
  maxFontPx: number
) => {
  const cy = f.baseY - (h0 + h1) / 2;
  if (cy < -20 || cy > CANVAS_HEIGHT + 20) return;
  // 글자 자리는 간판의 도로 쪽 끝에 고정 (화면에 보이는 폭에 맞추면 매 프레임 크기/위치가 흔들림)
  const boxW = Math.min(d1 - d0, TEXT_BOX_W * f.scale);
  const xa = f.innerX + f.dir * d0;
  const xb = f.innerX + f.dir * (d0 + boxW);
  const left = Math.min(xa, xb) + 6 * f.scale;
  const right = Math.max(xa, xb) - 6 * f.scale;
  const avail = right - left;

  ctx.save();
  ctx.font = '900 20px sans-serif';
  const w20 = ctx.measureText(text).width;
  const fontPx = Math.max(9, Math.min(maxFontPx * f.scale, (h1 - h0) * 0.78, (avail / w20) * 20));
  ctx.font = `900 ${fontPx.toFixed(1)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(2, fontPx * 0.14);
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
  const cx = (left + right) / 2;
  ctx.strokeText(text, cx, cy);
  ctx.fillStyle = color;
  ctx.fillText(text, cx, cy);
  ctx.restore();
};

const hashSeed = (b: StreetBuilding) =>
  Math.abs(Math.round(b.fromM * 7 + (b.side === 'LEFT' ? 3 : 11)));

/** 위층 창문 격자 */
const drawWindows = (
  ctx: CanvasRenderingContext2D,
  f: Face,
  fromH: number,
  toH: number,
  seed: number,
  withSmallSigns: boolean
) => {
  const s = f.scale;
  const rowH = 58 * s;
  const winColor = seed % 2 === 0 ? '#bfdbfe' : '#e0f2fe';
  let row = 0;
  for (let h = fromH; h + rowH <= toH; h += rowH, row++) {
    // 층 구분선
    faceRect(ctx, f, 0, BUILDING_SPAN, h, h + 3 * s, 'rgba(0, 0, 0, 0.12)');
    for (let d = 22 * s; d < 430 * s; d += 58 * s) {
      faceRect(ctx, f, d, d + 34 * s, h + 14 * s, h + 48 * s, 'rgba(15, 23, 42, 0.4)');
      faceRect(ctx, f, d + 3 * s, d + 31 * s, h + 17 * s, h + 45 * s, winColor);
      faceRect(ctx, f, d + 3 * s, d + 13 * s, h + 17 * s, h + 45 * s, 'rgba(255, 255, 255, 0.35)');
    }
    // 2층 이상 작은 가로 간판 (0_270.png 의 층마다 붙은 간판 느낌)
    if (withSmallSigns && (seed + row) % 3 === 0) {
      const colors = ['#dc2626', '#2563eb', '#16a34a', '#9333ea', '#ea580c'];
      faceRect(ctx, f, 18 * s, 170 * s, h + 50 * s, h + 57 * s, colors[(seed + row) % colors.length]);
    }
  }
};

/**
 * 건물 상자의 바닥/위 꼭짓점 (실제 3D 상자를 이 시점으로 투영)
 * - F: 앞쪽(fromM) 바닥, B: 뒤쪽(backM) 바닥. 0 = 도로 쪽, 1 = 바깥쪽
 * - 높이는 화면에서 수직 위로 heightPx * (그 지점 원근 스케일)
 */
interface BoxGeom {
  F0: { x: number; y: number };
  F1: { x: number; y: number };
  B0: { x: number; y: number };
  B1: { x: number; y: number };
  hF: number; // 앞쪽 높이 (px)
  hB: number; // 뒤쪽 높이 (px)
}

const boxGeom = (e: SideEdges, fromM: number, backM: number, playerY: number, heightPx: number): BoxGeom => {
  const f0 = project(e.inner, fromM - playerY);
  const f1 = project(e.outer, fromM - playerY);
  const b0 = project(e.inner, backM - playerY);
  const b1 = project(e.outer, backM - playerY);
  return {
    F0: { x: f0.sx, y: f0.sy },
    F1: { x: f1.sx, y: f1.sy },
    B0: { x: b0.sx, y: b0.sy },
    B1: { x: b1.sx, y: b1.sy },
    hF: heightPx * f0.scale,
    hB: heightPx * b0.scale,
  };
};

const poly = (ctx: CanvasRenderingContext2D, pts: Array<[number, number]>, color: string) => {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.fill();
};

/**
 * 옥상 + 도로 쪽 옆벽 (실제 상자 모양)
 * 이 시점은 왼쪽 위에서 내려다보므로 '왼쪽을 향한 벽'이 보인다:
 * 오른쪽 건물은 도로를 향한 옆벽이 보이고, 왼쪽 건물의 도로 쪽 옆벽은 옥상에 가려 안 보인다.
 */
const drawRoofAndSide = (
  ctx: CanvasRenderingContext2D,
  b: StreetBuilding,
  g: BoxGeom,
  scale: number,
  roofColor: string,
  sideColor: string
) => {
  const { F0, F1, B0, B1, hF, hB } = g;

  if (b.side === 'RIGHT') {
    // 옆벽 (세로 모서리 두 개 + 도로 방향으로 기운 위/아래 변)
    poly(ctx, [[F0.x, F0.y], [B0.x, B0.y], [B0.x, B0.y - hB], [F0.x, F0.y - hF]], sideColor);
    // 옆벽 층 구분선 (도로 방향과 나란히)
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.18)';
    ctx.lineWidth = Math.max(1, 2 * scale);
    for (let t = 0.22; t < 1; t += 0.2) {
      ctx.beginPath();
      ctx.moveTo(F0.x, F0.y - hF * t);
      ctx.lineTo(B0.x, B0.y - hB * t);
      ctx.stroke();
    }
    // 1층 옆 유리창 띠
    poly(ctx, [[F0.x, F0.y - 8 * scale], [B0.x, B0.y - 8 * scale], [B0.x, B0.y - 50 * scale], [F0.x, F0.y - 50 * scale]], 'rgba(30, 41, 59, 0.55)');
  }

  // 옥상
  poly(ctx, [[F0.x, F0.y - hF], [F1.x, F1.y - hF], [B1.x, B1.y - hB], [B0.x, B0.y - hB]], roofColor);

  // 옥상 난간 테두리
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = Math.max(2, 4 * scale);
  ctx.beginPath();
  ctx.moveTo(F1.x, F1.y - hF);
  ctx.lineTo(F0.x, F0.y - hF);
  ctx.lineTo(B0.x, B0.y - hB);
  ctx.lineTo(B1.x, B1.y - hB);
  ctx.stroke();
};

/** 옥상 물탱크/실외기 (옥상 가운데쯤) */
const drawRooftopProps = (
  ctx: CanvasRenderingContext2D,
  e: SideEdges,
  fromM: number,
  backM: number,
  playerY: number,
  heightPx: number,
  seed: number
) => {
  const midM = (fromM + backM) / 2;
  const p = project(at(e, 60 + (seed % 4) * 25), midM - playerY);
  const s = p.scale;
  const x = p.sx;
  const y = p.sy - heightPx * s;
  if (y < -40 || y > CANVAS_HEIGHT + 40) return;
  if (seed % 2 === 0) {
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(x - 16 * s, y - 26 * s, 32 * s, 26 * s);
    ctx.fillStyle = '#9ca3af';
    ctx.fillRect(x + 8 * s, y - 26 * s, 8 * s, 26 * s);
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(x - 18 * s, y - 30 * s, 36 * s, 5 * s);
  } else {
    ctx.fillStyle = '#d1d5db';
    ctx.fillRect(x - 14 * s, y - 16 * s, 28 * s, 16 * s);
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x - 3 * s, y - 8 * s, 5 * s, 0, Math.PI * 2);
    ctx.stroke();
  }
};

/** 도로 쪽 끝에서 바깥으로 d 만큼 떨어진 논리 x */
const at = (e: SideEdges, d: number) => e.inner + e.dir * d;

/**
 * 세로 돌출 간판: 앞면 도로 쪽 모서리에서 인도 쪽으로 튀어나온 세로 간판 (글자를 위에서 아래로)
 */
const drawProjectingSign = (
  ctx: CanvasRenderingContext2D,
  b: StreetBuilding,
  g: BoxGeom,
  scale: number
) => {
  if (!b.name) return;
  const chars = Array.from(b.name.replace(/\s/g, ''));
  const s = scale;
  const w = 30 * s;
  const bottom = g.F0.y - 76 * s;
  // 글자 수만큼만 길게 (건물이 높아도 간판이 화면 밖으로 길게 뻗지 않게)
  const top = Math.max(g.F0.y - g.hF * 0.92, bottom - (chars.length * 24 + 10) * s);
  const h = bottom - top;
  if (h < 40 * s || bottom < 0 || top > CANVAS_HEIGHT) return;
  // 인도 쪽으로 튀어나오게 (오른쪽 건물은 왼쪽으로, 왼쪽 건물은 오른쪽으로)
  const x = b.side === 'RIGHT' ? g.F0.x - w - 4 * s : g.F0.x + 4 * s;

  // 받침 팔
  ctx.fillStyle = '#334155';
  const armX = b.side === 'RIGHT' ? x + w : g.F0.x;
  ctx.fillRect(Math.min(armX, armX + (b.side === 'RIGHT' ? 4 * s : 4 * s)), top + 6 * s, 4 * s, 3 * s);
  ctx.fillRect(Math.min(armX, armX + 4 * s), bottom - 9 * s, 4 * s, 3 * s);

  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(x - 2 * s, top - 2 * s, w + 4 * s, h + 4 * s);
  ctx.fillStyle = b.signBg || '#334155';
  ctx.fillRect(x, top, w, h);

  const fontPx = Math.max(8, Math.min(22 * s, (h - 8 * s) / chars.length, w * 0.8));
  ctx.font = `900 ${fontPx.toFixed(1)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = b.signText || '#ffffff';
  const step = (h - 8 * s) / chars.length;
  const start = top + 4 * s + step / 2;
  chars.forEach((c, i) => ctx.fillText(c, x + w / 2, start + i * step));
};

/** 1층 유리 가게 + 문 */
const drawStorefront = (ctx: CanvasRenderingContext2D, f: Face, groundH: number) => {
  const s = f.scale;
  faceRect(ctx, f, 0, 440 * s, 0, groundH, '#1f2937');
  for (let d = 10 * s; d < 420 * s; d += 70 * s) {
    faceRect(ctx, f, d, d + 60 * s, 5 * s, groundH - 6 * s, '#475569');
    faceRect(ctx, f, d + 4 * s, d + 22 * s, 8 * s, groundH - 10 * s, 'rgba(226, 232, 240, 0.3)');
  }
  // 도로 쪽 출입문 (밝은 실내)
  faceRect(ctx, f, 12 * s, 46 * s, 0, groundH - 10 * s, '#fde68a');
};

const drawShop = (ctx: CanvasRenderingContext2D, b: StreetBuilding, f: Face, seed: number) => {
  const s = f.scale;
  faceRect(ctx, f, 0, BUILDING_SPAN, 0, f.height, b.wall);
  // 도로 쪽 모서리 기둥 음영
  faceRect(ctx, f, 0, 7 * s, 0, f.height, 'rgba(15, 23, 42, 0.18)');

  const groundH = 62 * s;
  drawStorefront(ctx, f, groundH);

  const sign0 = groundH + 4 * s;
  const sign1 = sign0 + 36 * s;
  if (b.kind === 'SHOP' && b.name) {
    faceRect(ctx, f, 0, 440 * s, sign0 - 3 * s, sign1 + 3 * s, '#f8fafc');
    faceRect(ctx, f, 3 * s, 437 * s, sign0, sign1, b.signBg || '#334155');
    faceText(ctx, f, 3 * s, 437 * s, sign0, sign1, b.name, b.signText || '#ffffff', 26);
  } else {
    const colors = ['#0ea5e9', '#f59e0b', '#ef4444', '#10b981', '#6366f1'];
    faceRect(ctx, f, 10 * s, 260 * s, sign0 + 6 * s, sign1 - 6 * s, colors[seed % colors.length]);
    faceRect(ctx, f, 30 * s, 200 * s, sign0 + 14 * s, sign1 - 14 * s, 'rgba(255, 255, 255, 0.55)');
  }

  drawWindows(ctx, f, sign1 + 6 * s, f.height - 8 * s, seed, b.kind === 'FILLER');
};

/** 중앙대학교병원: 아주 큰 흰 유리 건물 */
const drawHospital = (ctx: CanvasRenderingContext2D, b: StreetBuilding, f: Face) => {
  const s = f.scale;
  faceRect(ctx, f, 0, BUILDING_SPAN, 0, f.height, b.wall);

  // 커튼월 유리 띠 + 멀리언
  for (let h = 150 * s; h < f.height - 30 * s; h += 72 * s) {
    if (f.baseY - h > CANVAS_HEIGHT + 80 || f.baseY - h < -80) continue;
    faceRect(ctx, f, 10 * s, BUILDING_SPAN, h + 10 * s, h + 58 * s, '#3b82f6');
    faceRect(ctx, f, 10 * s, BUILDING_SPAN, h + 12 * s, h + 26 * s, 'rgba(191, 219, 254, 0.55)');
    for (let d = 50 * s; d < 640 * s; d += 46 * s) {
      faceRect(ctx, f, d, d + 4 * s, h + 10 * s, h + 58 * s, 'rgba(226, 232, 240, 0.9)');
    }
  }

  // 1층 로비 + 정문
  const lobbyH = 70 * s;
  faceRect(ctx, f, 0, 640 * s, 0, lobbyH, '#0f172a');
  for (let d = 10 * s; d < 630 * s; d += 50 * s) {
    faceRect(ctx, f, d, d + 42 * s, 6 * s, lobbyH - 6 * s, '#7dd3fc');
  }
  faceRect(ctx, f, 12 * s, 80 * s, 0, lobbyH - 12 * s, '#fef9c3');

  // 큰 병원 간판
  const s0 = lobbyH + 8 * s;
  const s1 = s0 + 58 * s;
  faceRect(ctx, f, 0, 640 * s, s0 - 4 * s, s1 + 4 * s, '#f8fafc');
  faceRect(ctx, f, 4 * s, 636 * s, s0, s1, b.signBg || '#1e40af');
  faceText(ctx, f, 4 * s, 636 * s, s0, s1, b.name || '', b.signText || '#ffffff', 40);

  faceRect(ctx, f, 0, 8 * s, 0, f.height, 'rgba(15, 23, 42, 0.2)');
};

/**
 * 병원 옥상: 헬리패드 + 옥상에 세워진 간판(병원 이름 / 응급의료센터)을 일정 간격으로.
 * 병원 옆을 지나가는 동안 계속 이름이 보이게 한다.
 */
const drawHospitalRoof = (
  ctx: CanvasRenderingContext2D,
  b: StreetBuilding,
  f: Face,
  e: SideEdges,
  playerY: number,
  heightPx: number,
  maxM: number
) => {
  // 옥상 위 depth m 지점의 화면 위치 (도로 쪽 옥상 가장자리)
  const roofAt = (m: number) => {
    const p = project(e.inner, m - playerY);
    return { x: p.sx, y: p.sy - heightPx * p.scale };
  };

  // 헬리패드
  const hp = roofAt(b.fromM + 40);
  if (b.fromM + 40 < maxM - 3 && hp.y > -120 && hp.y < CANVAS_HEIGHT + 120) {
    const cx = hp.x + e.dir * 120 * f.scale;
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.ellipse(cx, hp.y, 70 * f.scale, 48 * f.scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = Math.max(2, 4 * f.scale);
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = `900 ${Math.round(46 * f.scale)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('H', cx, hp.y);
  }

  // 옥상 간판 (세워진 판)
  let k = 0;
  for (let m = b.fromM + 14; m < Math.min(b.toM - 4, maxM - 1); m += 16, k++) {
    if (Math.abs(m - b.fromM - 40) < 6) continue; // 헬리패드 자리 비움
    const p = roofAt(m);
    if (p.y < -80 || p.y > CANVAS_HEIGHT + 80) continue;
    const text = k % 2 === 1 ? '응급의료센터' : b.name || '';
    const bg = k % 2 === 1 ? '#dc2626' : '#1e40af';
    const boardH = 56 * f.scale;
    const lf: Face = { innerX: p.x + e.dir * 6 * f.scale, baseY: p.y, height: boardH + 14 * f.scale, dir: e.dir, scale: f.scale };
    // 받침 기둥
    faceRect(ctx, lf, 30 * f.scale, 38 * f.scale, 0, 14 * f.scale, '#334155');
    faceRect(ctx, lf, 140 * f.scale, 148 * f.scale, 0, 14 * f.scale, '#334155');
    faceRect(ctx, lf, 0, 176 * f.scale, 14 * f.scale, 14 * f.scale + boardH, '#f8fafc');
    faceRect(ctx, lf, 3 * f.scale, 173 * f.scale, 17 * f.scale, 11 * f.scale + boardH, bg);
    faceText(ctx, lf, 3 * f.scale, 173 * f.scale, 17 * f.scale, 11 * f.scale + boardH, text, '#ffffff', 30);
  }
};

/** 흑석역 출입구 (9호선, 유리 지붕 계단 입구) */
const drawSubwayEntrance = (ctx: CanvasRenderingContext2D, b: StreetBuilding, f: Face) => {
  const s = f.scale;
  // 기둥 프레임 + 유리벽 + 계단 입구
  faceRect(ctx, f, 10 * s, 220 * s, 0, f.height, '#334155');
  faceRect(ctx, f, 18 * s, 212 * s, 0, f.height - 40 * s, '#bae6fd');
  faceRect(ctx, f, 40 * s, 140 * s, 0, f.height - 56 * s, '#1e293b');
  for (let h = 6 * s; h < f.height - 60 * s; h += 12 * s) {
    faceRect(ctx, f, 44 * s, 136 * s, h, h + 4 * s, '#64748b');
  }
  // 역 이름판 (9호선 금색)
  faceRect(ctx, f, 6 * s, 224 * s, f.height - 38 * s, f.height, b.signBg || '#a68b4b');
  faceText(ctx, f, 6 * s, 224 * s, f.height - 38 * s, f.height, '9 흑석역', b.signText || '#ffffff', 26);
};

/** 건물 사이 좁은 틈 (골목) */
const ALLEY_M = 0.8;

/** 건물 키 (화면 px, 원근 스케일 1 기준) */
const heightFor = (b: StreetBuilding, seed: number) => {
  if (b.kind === 'HOSPITAL') return 760;
  if (b.kind === 'SUBWAY') return 150;
  // 키를 들쭉날쭉하게: 뒤 건물이 앞 건물보다 높으면 위층 앞면이 옥상 너머로 보임
  return [300, 460, 360, 560, 400, 620, 330][seed % 7];
};

/** 건물들이 서 있는 땅 (골목 사이로 보이는 바닥) */
const drawLotGround = (ctx: CanvasRenderingContext2D, e: SideEdges, m0: number, m1: number, playerY: number) => {
  if (m1 <= m0) return;
  const steps = Math.max(1, Math.ceil((m1 - m0) / 1));
  ctx.fillStyle = '#7c7f86';
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const p = project(e.inner, m0 + ((m1 - m0) * i) / steps - playerY);
    if (i === 0) ctx.moveTo(p.sx, p.sy);
    else ctx.lineTo(p.sx, p.sy);
  }
  for (let i = steps; i >= 0; i--) {
    const p = project(e.outer, m0 + ((m1 - m0) * i) / steps - playerY);
    ctx.lineTo(p.sx, p.sy);
  }
  ctx.closePath();
  ctx.fill();
};

/**
 * 도로가 끝나 보이는 지평선 선(화면 y). drawZoneRoad 의 ROAD_HORIZON_Y 와 같은 값.
 * 이 선보다 먼(화면 위쪽) 땅에 있는 건물 부분은 그리지 않는다 -> 건물이 도로와 함께 지평선에서 나타남
 */
const HORIZON_Y = 124;
/** 지평선까지의 거리 (플레이어 기준 m). project 의 sy 가 HORIZON_Y 가 되는 지점을 이분 탐색 */
const HORIZON_REL_M = (() => {
  let a = 0;
  let b = 30;
  for (let i = 0; i < 40; i++) {
    const mid = (a + b) / 2;
    if (project(ROAD_LEFT, mid).sy > HORIZON_Y) a = mid;
    else b = mid;
  }
  return a;
})();
/** 건물이 지평선을 넘어오면서 서서히 나타나는 거리 (m) */
const FADE_IN_M = 1.5;

const visibleBuildings = (playerWorldY: number) => {
  const lo = playerWorldY - VIEW_BEHIND_M;
  const hi = Math.min(playerWorldY + VIEW_AHEAD_M, playerWorldY + HORIZON_REL_M);
  return { lo, hi, list: STREET_BUILDINGS.filter((b) => b.toM > lo && b.fromM < hi) };
};

/** 건물들이 서 있는 땅. 길가 소품(전봇대 등)보다 먼저 그린다 */
export const drawStreetLots = (ctx: CanvasRenderingContext2D, playerWorldY: number): void => {
  const { lo, hi, list } = visibleBuildings(playerWorldY);
  ctx.save();
  for (const side of ['LEFT', 'RIGHT'] as const) {
    const ofSide = list.filter((b) => b.side === side);
    if (ofSide.length === 0) continue;
    const m0 = Math.max(lo, Math.min(...ofSide.map((b) => b.fromM)));
    const m1 = Math.min(hi, Math.max(...ofSide.map((b) => b.toM)));
    drawLotGround(ctx, edgesFor(side), m0, m1, playerWorldY);
  }
  ctx.restore();
};

/**
 * 한쪽 길가 건물들을 먼 것부터 그린다.
 * 이 시점은 왼쪽 위에서 내려다보므로 가리는 순서가 좌우가 다르다:
 * - 왼쪽 건물은 왼쪽 인도 소품보다 카메라에 가까움 -> 소품을 다 그린 뒤에 그린다
 * - 오른쪽 건물은 오른쪽 인도 소품보다 멀다 -> 소품보다 먼저 그린다
 * (drawCampusBuildings 에서 이 순서로 부른다)
 */
export const drawStreetBuildings = (
  ctx: CanvasRenderingContext2D,
  playerWorldY: number,
  side: 'LEFT' | 'RIGHT'
): void => {
  const { hi: horizonM, list } = visibleBuildings(playerWorldY);
  const visible = list.filter((b) => b.side === side);
  if (visible.length === 0) return;

  ctx.save();
  // 먼 것(fromM 큰 것)부터 그려서 가까운 건물이 앞에 서 있게 (돌출 간판도 자기 건물과 함께)
  visible.sort((a, b) => b.fromM - a.fromM);

  for (const b of visible) {
    const e = edgesForBuilding(b);
    const seed = hashSeed(b);
    const heightPx = heightFor(b, seed);
    // 지평선 너머 부분은 잘라냄 (건물 뒤쪽이 지평선에서 조금씩 드러남)
    const backM = Math.min(b.kind === 'HOSPITAL' ? b.toM - 2 : b.toM - ALLEY_M, horizonM);
    if (backM <= b.fromM) continue;
    ctx.globalAlpha = Math.max(0, Math.min(1, (horizonM - b.fromM) / FADE_IN_M));
    const g = boxGeom(e, b.fromM, backM, playerWorldY, heightPx);
    if (g.B0.y - g.hB > CANVAS_HEIGHT + 40) continue; // 이미 다 지나감
    const scale = project(e.inner, b.fromM - playerWorldY).scale;

    const roofColor = b.kind === 'SUBWAY' ? '#94a3b8' : b.kind === 'HOSPITAL' ? '#64748b' : shade(b.wall, -0.3);
    drawRoofAndSide(ctx, b, g, scale, roofColor, shade(b.wall, -0.38));

    const f: Face = { innerX: g.F0.x, baseY: g.F0.y, height: g.hF, dir: e.dir, scale };
    if (b.kind === 'HOSPITAL') drawHospitalRoof(ctx, b, f, e, playerWorldY, heightPx, backM);
    else if (b.kind !== 'SUBWAY') drawRooftopProps(ctx, e, b.fromM, backM, playerWorldY, heightPx, seed);

    switch (b.kind) {
      case 'HOSPITAL':
        drawHospital(ctx, b, f);
        break;
      case 'SUBWAY':
        drawSubwayEntrance(ctx, b, f);
        break;
      default:
        drawShop(ctx, b, f, seed);
    }

    if (b.kind === 'SHOP') drawProjectingSign(ctx, b, g, scale);
  }

  ctx.restore();
};

/** 도감에서도 게임과 같은 건물 외벽·창문·간판을 사용한다. 미등록 이름은 가린다. */
export const drawStreetBuildingPreview = (
  ctx: CanvasRenderingContext2D,
  building: StreetBuilding,
  revealed: boolean
): void => {
  ctx.clearRect(0, 0, 320, 240);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.beginPath();
  ctx.rect(16, 16, 288, 208);
  ctx.clip();
  const seed = hashSeed(building);
  const preview = { ...building, name: revealed ? building.name : building.name?.replace(/[^&]/gu, '?') };
  const scale = building.kind === 'HOSPITAL' ? 0.3 : 0.6;
  const face: Face = {
    innerX: 20,
    baseY: 220,
    height: building.kind === 'HOSPITAL' ? 204 : Math.min(180, heightFor(building, seed) * scale),
    dir: 1,
    scale,
  };
  if (building.kind === 'HOSPITAL') drawHospital(ctx, preview, face);
  else drawShop(ctx, preview, face, seed);
  ctx.restore();
};
