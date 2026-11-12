import {
  BASE_FORWARD_SPEED,
  LATERAL_SPEED,
  FORWARD_SPEED_BOOST,
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

  // Forward running (Automatic forward progression + Up boost / Down brake)
  let currentSpeed = BASE_FORWARD_SPEED;
  if (input.moveUp) currentSpeed += FORWARD_SPEED_BOOST;
  if (input.moveDown) currentSpeed = Math.max(1.0, currentSpeed - FORWARD_SPEED_BOOST);

  if (isStunned) {
    currentSpeed *= OBSTACLE_SLOW_FACTOR;
  }

  player.worldY += currentSpeed;
  if (player.worldY > STAGE_LENGTH) {
    player.worldY = STAGE_LENGTH;
  }

  // Running animation cycle
  const animInterval = isStunned
    ? PLAYER_CONFIG.animationIntervalMs * 2
    : PLAYER_CONFIG.animationIntervalMs;

  player.frameTimer += deltaTimeMs;
  if (player.frameTimer >= animInterval) {
    player.frameTimer = 0;
    player.currentFrame = (player.currentFrame + 1) % PLAYER_CONFIG.totalFrames;
  }
};
