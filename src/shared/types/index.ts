export type GameState = 'READY' | 'PLAYING' | 'PAUSED' | 'GAMEOVER';

export interface ScoreData {
  distance: number;
  coins: number;
  highScore: number;
}
