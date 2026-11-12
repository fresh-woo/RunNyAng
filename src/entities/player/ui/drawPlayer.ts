import { Player } from '../model/types';

export const drawPlayer = (
  ctx: CanvasRenderingContext2D,
  player: Player,
  customFrames?: (HTMLImageElement | null)[]
): void => {
  const { x, screenY, width, height, currentFrame } = player;

  // If the designer has supplied real image frames, render them!
  if (customFrames && customFrames[currentFrame]) {
    const img = customFrames[currentFrame]!;
    ctx.drawImage(img, x, screenY, width, height);
    return;
  }

  // --- DUMMY CUTE PIXEL-ART CAT RENDERER (2~3 Frame Alternating) ---
  ctx.save();

  // Shadow underneath
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.beginPath();
  ctx.ellipse(x + width / 2, screenY + height - 2, width / 2, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Vertical bobbing effect per frame
  const bobY = currentFrame === 1 ? -2 : 0;

  // Cat Body (Warm cream / Calico cute style)
  ctx.fillStyle = '#fef08a'; // Light cute yellow/cream body
  ctx.strokeStyle = '#854d0e'; // Warm dark outline
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.roundRect(x + 4, screenY + 10 + bobY, width - 8, height - 16, 10);
  ctx.fill();
  ctx.stroke();

  // Cat Ears (pointed towards front/diagonal)
  ctx.fillStyle = '#f59e0b';
  // Left ear
  ctx.beginPath();
  ctx.moveTo(x + 8, screenY + 12 + bobY);
  ctx.lineTo(x + 14, screenY + bobY);
  ctx.lineTo(x + 20, screenY + 12 + bobY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Right ear
  ctx.beginPath();
  ctx.moveTo(x + width - 20, screenY + 12 + bobY);
  ctx.lineTo(x + width - 14, screenY + bobY);
  ctx.lineTo(x + width - 8, screenY + 12 + bobY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Cat Tail (sways based on frame 0, 1, 2)
  const tailSway = currentFrame === 0 ? -8 : currentFrame === 2 ? 8 : 0;
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x + width / 2, screenY + height - 8);
  ctx.quadraticCurveTo(
    x + width / 2 + tailSway,
    screenY + height - 24,
    x + width / 2 + tailSway * 1.5,
    screenY + height - 28
  );
  ctx.stroke();

  // Running Paws (Alternating frames for realistic cute run motion)
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#854d0e';
  ctx.lineWidth = 2;

  // Left Paw
  const leftPawOffset = currentFrame === 0 ? -4 : currentFrame === 1 ? 0 : 4;
  ctx.beginPath();
  ctx.arc(x + 10, screenY + height - 6 + leftPawOffset, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Right Paw
  const rightPawOffset = currentFrame === 2 ? -4 : currentFrame === 1 ? 0 : 4;
  ctx.beginPath();
  ctx.arc(x + width - 10, screenY + height - 6 + rightPawOffset, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Small frame indicator badge (helpful for planner & designer verification)
  if (player.stunTimerMs > 0) {
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('⚡경직!', x + width / 2 - 12, screenY - 2);
  } else {
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(`F${currentFrame + 1}`, x + width / 2 - 8, screenY + 6);
  }

  ctx.restore();
};
