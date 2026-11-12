import { Coin } from '../model/types';

export const drawCoins = (ctx: CanvasRenderingContext2D, coins: Coin[]): void => {
  ctx.fillStyle = '#eab308';
  for (const coin of coins) {
    ctx.beginPath();
    ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
};
