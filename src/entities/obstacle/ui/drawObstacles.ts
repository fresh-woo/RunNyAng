import { Obstacle } from '../model/types';

export const drawObstacles = (ctx: CanvasRenderingContext2D, obstacles: Obstacle[]): void => {
  ctx.fillStyle = '#ef4444';
  for (const obs of obstacles) {
    ctx.beginPath();
    ctx.roundRect(obs.x, obs.y, obs.width, obs.height, 4);
    ctx.fill();
  }
};
