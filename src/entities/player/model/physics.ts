import { GRAVITY, GROUND_Y, JUMP_FORCE, PLAYER_INITIAL_CONFIG } from '../../../shared/config/gameConfig';
import { Player } from './types';

export const updatePlayerPhysics = (player: Player): void => {
  player.y += player.velocityY;
  player.velocityY += GRAVITY;

  const groundLevel = GROUND_Y - player.height;
  if (player.y >= groundLevel) {
    player.y = groundLevel;
    player.velocityY = 0;
    player.isJumping = false;
    player.jumpCount = 0;
  }
};

export const jumpPlayer = (player: Player): boolean => {
  if (player.jumpCount < PLAYER_INITIAL_CONFIG.maxJumpCount) {
    player.velocityY = JUMP_FORCE;
    player.isJumping = true;
    player.jumpCount += 1;
    player.isSliding = false;
    player.height = PLAYER_INITIAL_CONFIG.height;
    return true;
  }
  return false;
};

export const startPlayerSlide = (player: Player): void => {
  if (player.isJumping) return;
  player.isSliding = true;
  player.height = PLAYER_INITIAL_CONFIG.slidingHeight;
  player.y = GROUND_Y - PLAYER_INITIAL_CONFIG.slidingHeight;
};

export const endPlayerSlide = (player: Player): void => {
  if (player.isSliding) {
    player.isSliding = false;
    player.height = PLAYER_INITIAL_CONFIG.height;
    player.y = GROUND_Y - PLAYER_INITIAL_CONFIG.height;
  }
};
