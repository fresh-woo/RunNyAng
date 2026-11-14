export type GameState = 'READY' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' | 'CLEAR';

export interface ScoreData {
  distance: number;
  maxDistance: number;
  progressPercent: number;
  coins: number;
  highScore: number;
  elapsedSeconds: number;
  bestTimeSeconds: number | null; // 타임어택 최고 기록 (초)
  currentZoneLabel?: string;     // 현재 캠퍼스 구간 라벨 (예: "정문 안 진입로")
}

