import { PLAYER_CONFIG } from '../../../shared/config/gameConfig';

export interface Player {
  x: number;
  screenY: number;
  worldY: number;
  width: number;
  height: number;
  currentFrame: number;
  frameTimer: number;
  facing: 'LEFT' | 'RIGHT' | 'UP';
  isMoving: boolean;
  stunTimerMs: number; // 장애물 피격 시 경직/감속 타이머
}

export const createInitialPlayer = (): Player => ({
  x: PLAYER_CONFIG.initialX,
  screenY: PLAYER_CONFIG.initialY,
  worldY: 0,
  width: PLAYER_CONFIG.width,
  height: PLAYER_CONFIG.height,
  currentFrame: 0,
  frameTimer: 0,
  facing: 'UP',
  isMoving: true,
  stunTimerMs: 0,
});

