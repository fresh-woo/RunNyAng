import { Player } from '../model/types';

export const drawPlayer = (
  ctx: CanvasRenderingContext2D,
  player: Player,
  catFrames?: (HTMLImageElement | null)[],
  catHurtImg?: HTMLImageElement | null
): void => {
  const { x, screenY, width, height, currentFrame } = player;
  const isStunned = player.stunTimerMs > 0;

  ctx.save();

  // 1. Shadow underneath
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
  ctx.beginPath();
  ctx.ellipse(x + width / 2, screenY + height - 2, width / 2.2, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. If stunned and hurt image exists, render hurt expression
  if (isStunned && catHurtImg && catHurtImg.complete) {
    ctx.drawImage(catHurtImg, x, screenY, width, height);

    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚡경직!', x + width / 2, screenY - 4);

    ctx.restore();
    return;
  }

  // 3. Render pixel art running cat frame if available
  const frameImg = catFrames && catFrames[currentFrame];
  if (frameImg && frameImg.complete) {
    // Vertical bobbing feeling
    const bobY = currentFrame === 1 ? -4 : 0;
    ctx.drawImage(frameImg, x, screenY + bobY, width, height);

    if (isStunned) {
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚡경직!', x + width / 2, screenY - 4);
    }

    ctx.restore();
    return;
  }

  // 4. Fallback: Dummy pixel-art cat renderer
  const bobY = currentFrame === 1 ? -2 : 0;

  ctx.fillStyle = '#fef08a';
  ctx.strokeStyle = '#854d0e';
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.roundRect(x + 4, screenY + 10 + bobY, width - 8, height - 16, 10);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.moveTo(x + 8, screenY + 12 + bobY);
  ctx.lineTo(x + 14, screenY + bobY);
  ctx.lineTo(x + 20, screenY + 12 + bobY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + width - 20, screenY + 12 + bobY);
  ctx.lineTo(x + width - 14, screenY + bobY);
  ctx.lineTo(x + width - 8, screenY + 12 + bobY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

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

  if (isStunned) {
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚡경직!', x + width / 2, screenY - 2);
  }

  ctx.restore();
};

