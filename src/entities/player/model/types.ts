import { PLAYER_INITIAL_CONFIG } from '../../../shared/config/gameConfig';

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

export const createInitialPlayer = (): Player => ({
  x: PLAYER_INITIAL_CONFIG.x,
  y: PLAYER_INITIAL_CONFIG.y,
  width: PLAYER_INITIAL_CONFIG.width,
  height: PLAYER_INITIAL_CONFIG.height,
  velocityY: 0,
  isJumping: false,
  jumpCount: 0,
  isSliding: false,
});
