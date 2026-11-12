import {
  BASE_FORWARD_SPEED,
  LATERAL_SPEED,
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
  // Lateral movement (Left / Right)
  if (input.moveLeft) {
    player.x -= LATERAL_SPEED;
    player.facing = 'LEFT';
  } else if (input.moveRight) {
    player.x += LATERAL_SPEED;
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
  if (input.moveUp) currentSpeed += 2.5;
  if (input.moveDown) currentSpeed = Math.max(1.5, currentSpeed - 2.5);

  player.worldY += currentSpeed;
  if (player.worldY > STAGE_LENGTH) {
    player.worldY = STAGE_LENGTH;
  }

  // 2~3 Frame running animation cycle
  player.frameTimer += deltaTimeMs;
  if (player.frameTimer >= PLAYER_CONFIG.animationIntervalMs) {
    player.frameTimer = 0;
    player.currentFrame = (player.currentFrame + 1) % PLAYER_CONFIG.totalFrames;
  }
};
