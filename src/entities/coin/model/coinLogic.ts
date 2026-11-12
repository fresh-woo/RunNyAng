import { CANVAS_WIDTH, GROUND_Y } from '../../../shared/config/gameConfig';
import { Player } from '../../player/model/types';
import { Coin } from './types';

export const createCoin = (isHigh: boolean = false): Coin => {
  return {
    id: Date.now() + Math.random(),
    x: CANVAS_WIDTH + 50,
    y: GROUND_Y - (isHigh ? 90 : 40),
    radius: 12,
    collected: false,
  };
};

export const checkCoinCollision = (player: Player, coin: Coin): boolean => {
  const distX = Math.abs(coin.x - (player.x + player.width / 2));
  const distY = Math.abs(coin.y - (player.y + player.height / 2));

  return distX < player.width / 2 + coin.radius && distY < player.height / 2 + coin.radius;
};
