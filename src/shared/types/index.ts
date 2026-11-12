export type GameState = 'READY' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' | 'CLEAR';

export interface ScoreData {
  distance: number;
  maxDistance: number;
  progressPercent: number;
  coins: number;
  highScore: number;
  elapsedSeconds: number;
}
