import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  ROAD_LEFT,
  ROAD_RIGHT,
} from '../../../shared/config/gameConfig';
import { StageObject } from '../model/types';
import { GameAssets } from '../../../shared/lib/assetLoader';

export const drawCampusEnvironment = (
  ctx: CanvasRenderingContext2D,
  playerWorldY: number
): void => {
  // 1. Campus Ground / Grass (Sides)
  ctx.fillStyle = '#166534'; // Lush campus green
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // 2. Campus Main Road (Pavement)
  ctx.fillStyle = '#334155'; // Asphalt / Sidewalk grey
  ctx.fillRect(ROAD_LEFT, 0, ROAD_RIGHT - ROAD_LEFT, CANVAS_HEIGHT);

  // 3. Campus Road Curbs & Lane Markings
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(ROAD_LEFT - 6, 0, 6, CANVAS_HEIGHT);
  ctx.fillRect(ROAD_RIGHT, 0, 6, CANVAS_HEIGHT);

  // Moving dash lines based on playerWorldY (Perspective scrolling feeling)
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 4;
  ctx.setLineDash([30, 40]);
  ctx.lineDashOffset = -playerWorldY % 70;

  const roadCenter = (ROAD_LEFT + ROAD_RIGHT) / 2;
  ctx.beginPath();
  ctx.moveTo(roadCenter - 80, 0);
  ctx.lineTo(roadCenter - 80, CANVAS_HEIGHT);
  ctx.moveTo(roadCenter + 80, 0);
  ctx.lineTo(roadCenter + 80, CANVAS_HEIGHT);
  ctx.stroke();
  ctx.setLineDash([]); // Reset line dash
};

export const drawStageObjects = (
  ctx: CanvasRenderingContext2D,
  objects: StageObject[],
  playerWorldY: number,
  playerScreenY: number,
  assets?: GameAssets | null
): void => {
  for (const obj of objects) {
    if (obj.collected) continue;

    // Relative screen Y position based on player's position
    const relScreenY = playerScreenY - (obj.worldY - playerWorldY);

    // Cull off-screen objects
    if (relScreenY < -140 || relScreenY > CANVAS_HEIGHT + 120) continue;

    ctx.save();

    if (obj.type === 'LANDMARK') {
      // Draw Campus Landmark Signboard
      ctx.fillStyle = '#0284c7';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(obj.x, relScreenY, obj.width, obj.height, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(obj.name, obj.x + obj.width / 2, relScreenY + obj.height / 2 + 4);
    } else if (obj.type === 'FINISH_LINE') {
      // Draw 310관 Finish Line
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(obj.x, relScreenY, obj.width, obj.height);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(obj.name, obj.x + obj.width / 2, relScreenY - 8);
    } else if (obj.type === 'ITEM') {
      const churuImg = assets?.stageAssets.itemChuru;
      if (churuImg && churuImg.complete) {
        ctx.drawImage(churuImg, obj.x, relScreenY, obj.width + 10, obj.height + 10);
      } else {
        // Fallback
        ctx.fillStyle = '#ec4899';
        ctx.beginPath();
        ctx.roundRect(obj.x, relScreenY, obj.width, obj.height, 4);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('츄르', obj.x + obj.width / 2, relScreenY + 16);
      }
    } else if (obj.type === 'OBSTACLE') {
      let sprite: HTMLImageElement | null | undefined = null;
      if (obj.subType === 'COFFEE') {
        sprite = assets?.stageAssets.obsCoffee;
      } else if (obj.subType === 'EXAM') {
        sprite = assets?.stageAssets.obsBooks;
      } else if (obj.name.includes('라바콘') || obj.name.includes('공사')) {
        sprite = assets?.stageAssets.obsCone;
      } else if (obj.subType === 'KICKBOARD') {
        sprite = assets?.stageAssets.obsCone; // substitute cone/barrier
      }

      if (sprite && sprite.complete) {
        ctx.drawImage(sprite, obj.x, relScreenY, obj.width, obj.height);
      } else {
        // Fallback
        ctx.fillStyle = obj.color || '#ef4444';
        ctx.beginPath();
        ctx.roundRect(obj.x, relScreenY, obj.width, obj.height, 6);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(obj.name.slice(0, 5), obj.x + obj.width / 2, relScreenY - 4);
      }
    }

    ctx.restore();
  }
};

