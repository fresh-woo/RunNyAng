import {
  WALK_SPEED,
  RUN_SPEED,
  SLOW_WALK_SPEED,
  LATERAL_SPEED,
  OBSTACLE_SLOW_FACTOR,
  ROAD_LEFT,
  ROAD_RIGHT,
  STAGE_LENGTH,
  PLAYER_CONFIG,
} from '../../../shared/config/gameConfig';
import { Player } from './types';

export interface MovementInput {
  moveLeft: boolean;
  moveRight: boolean;
  moveUp: boolean;
  moveDown: boolean;
}

export const updatePlayerMovement = (
  player: Player,
  input: MovementInput,
  deltaTimeMs: number
): void => {
  // Update stun timer
  if (player.stunTimerMs > 0) {
    player.stunTimerMs = Math.max(0, player.stunTimerMs - deltaTimeMs);
  }
  const isStunned = player.stunTimerMs > 0;

  // Lateral movement (Left / Right) - slowed down if stunned
  const lateralSpeed = isStunned ? LATERAL_SPEED * OBSTACLE_SLOW_FACTOR : LATERAL_SPEED;
  if (input.moveLeft) {
    player.x -= lateralSpeed;
    player.facing = 'LEFT';
  } else if (input.moveRight) {
    player.x += lateralSpeed;
    player.facing = 'RIGHT';
  } else {
    player.facing = 'UP';
  }

  // Clamping X within campus road bounds
  const minX = ROAD_LEFT + 10;
  const maxX = ROAD_RIGHT - player.width - 10;
  player.x = Math.max(minX, Math.min(maxX, player.x));

  // Forward movement (초당 m/s 기준, deltaTimeMs 기반 이동)
  // 그냥 걷는 속도: 3.0 m/s
  // 달리는 속도: 6.0 m/s
  // 느리게 걷는 속도: 1.5 m/s
  let speedMps = WALK_SPEED;
  if (input.moveUp) {
    speedMps = RUN_SPEED;
  } else if (input.moveDown) {
    speedMps = SLOW_WALK_SPEED;
  }

  if (isStunned) {
    speedMps *= OBSTACLE_SLOW_FACTOR;
  }

  const dtSeconds = deltaTimeMs / 1000;
  player.worldY += speedMps * dtSeconds;
  if (player.worldY > STAGE_LENGTH) {
    player.worldY = STAGE_LENGTH;
  }

  // Running animation cycle (속도 상태에 따른 발구름 주기 동적 반영)
  let animInterval = PLAYER_CONFIG.animationIntervalMs;
  if (isStunned) {
    animInterval = 240;
  } else if (input.moveUp) {
    animInterval = 80;
  } else if (input.moveDown) {
    animInterval = 180;
  }

  player.frameTimer += deltaTimeMs;
  if (player.frameTimer >= animInterval) {
    player.frameTimer = 0;
    player.currentFrame = (player.currentFrame + 1) % PLAYER_CONFIG.totalFrames;
  }
};
