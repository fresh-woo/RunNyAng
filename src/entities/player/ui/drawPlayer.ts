import { Player } from '../model/types';

export const drawPlayer = (ctx: CanvasRenderingContext2D, player: Player): void => {
  // Body
  ctx.fillStyle = player.isSliding ? '#f59e0b' : '#38bdf8';
  ctx.beginPath();
  ctx.roundRect(player.x, player.y, player.width, player.height, 8);
  ctx.fill();

  // Face / Eye detail
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  const eyeX = player.x + (player.isSliding ? 34 : 32);
  const eyeY = player.y + (player.isSliding ? 12 : 16);
  ctx.arc(eyeX, eyeY, 4, 0, Math.PI * 2);
  ctx.fill();
};
