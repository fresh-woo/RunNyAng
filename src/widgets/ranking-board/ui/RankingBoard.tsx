import React, { useCallback, useEffect, useState } from 'react';
import { fetchRankings, formatRecordTime, RankingEntry } from '../../../entities/ranking';
import './RankingBoard.css';

interface RankingBoardProps {
  onClose: () => void;
  /** 강조할 닉네임 (방금 등록한 기록) */
  highlightNickname?: string;
}

export const RankingBoard: React.FC<RankingBoardProps> = ({ onClose, highlightNickname }) => {
  const [rankings, setRankings] = useState<RankingEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(null);
    setRankings(null);
    fetchRankings(50)
      .then(setRankings)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : '랭킹을 불러오지 못했어요.'));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="ranking-board-backdrop" onClick={onClose}>
      <div className="ranking-board" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="랭킹">
        <div className="ranking-board-header">
          <h2>🏆 명예의 전당</h2>
          <button className="ranking-board-close" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>
        <p className="ranking-board-sub">기록이 빠른 순, 같으면 츄르가 많은 순</p>

        <div className="ranking-board-body">
          {error && (
            <div className="ranking-board-state">
              <p>{error}</p>
              <button className="btn btn-secondary" onClick={load}>
                다시 시도
              </button>
            </div>
          )}
          {!error && rankings === null && <p className="ranking-board-state">불러오는 중…</p>}
          {!error && rankings?.length === 0 && (
            <p className="ranking-board-state">아직 기록이 없어요. 첫 번째 주인공이 되어 보세요!</p>
          )}
          {!error && rankings && rankings.length > 0 && (
            <table className="ranking-table">
              <thead>
                <tr>
                  <th>순위</th>
                  <th>닉네임</th>
                  <th>기록</th>
                  <th>츄르</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((r) => (
                  <tr key={r.nickname} className={r.nickname === highlightNickname ? 'is-me' : undefined}>
                    <td>{r.rank <= 3 ? ['🥇', '🥈', '🥉'][r.rank - 1] : r.rank}</td>
                    <td className="ranking-nickname">{r.nickname}</td>
                    <td>{formatRecordTime(r.timeSeconds)}</td>
                    <td>{r.churu}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
