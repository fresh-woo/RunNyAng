export type GameState = 'READY' | 'PLAYING' | 'PAUSED' | 'GAMEOVER';

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityY: number;
  isJumping: boolean;
  jumpCount: number;
  isSliding: boolean;
}

export type ObstacleType = 'GROUND' | 'FLYING';

export interface Obstacle {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: ObstacleType;
  passed: boolean;
}

export interface Coin {
  id: number;
  x: number;
  y: number;
  radius: number;
  collected: boolean;
}

export interface ScoreData {
  distance: number;
  coins: number;
  highScore: number;
}
