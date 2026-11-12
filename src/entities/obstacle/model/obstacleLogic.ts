import { CANVAS_WIDTH, GROUND_Y } from '../../../shared/config/gameConfig';
import { Player } from '../../player/model/types';
import { Obstacle } from './types';

export const createObstacle = (isFlying: boolean = false): Obstacle => {
  return {
    id: Date.now() + Math.random(),
    x: CANVAS_WIDTH + 50,
    y: isFlying ? GROUND_Y - 80 : GROUND_Y - 45,
    width: isFlying ? 40 : 35,
    height: isFlying ? 25 : 45,
    type: isFlying ? 'FLYING' : 'GROUND',
    passed: false,
  };
};

export const checkObstacleCollision = (player: Player, obstacle: Obstacle): boolean => {
  return (
    player.x < obstacle.x + obstacle.width &&
    player.x + player.width > obstacle.x &&
    player.y < obstacle.y + obstacle.height &&
    player.y + player.height > obstacle.y
  );
};
