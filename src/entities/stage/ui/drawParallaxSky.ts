import { CANVAS_WIDTH } from '../../../shared/config/gameConfig';

/**
 * 3/4 쿼터뷰 패럴랙스 하늘 및 원경 캠퍼스 스카이라인 렌더링
 * - Layer 0: 하늘 그라데이션 및 먼 언덕 (0.05배 패럴랙스)
 * - Layer 1: 원경 캠퍼스 고층 건물 실루엣 및 수목 (0.15배 패럴랙스)
 */
export const drawParallaxSky = (
  ctx: CanvasRenderingContext2D,
  playerWorldY: number
): void => {
  ctx.save();

  // 1. 하늘 그라데이션 (시원하고 화창한 서울 캠퍼스 하늘)
  const skyGradient = ctx.createLinearGradient(0, 0, 0, 180);
  skyGradient.addColorStop(0, '#38bdf8');   // 상단 맑은 스카이블루
  skyGradient.addColorStop(0.6, '#bae6fd'); // 중단 은은한 하늘빛
  skyGradient.addColorStop(1, '#f0f9ff');   // 지평선 밝은 빛
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, 180);

  // 구름 실루엣 (0.03배 완만한 패럴랙스)
  const cloudOffset = -(playerWorldY * 0.3) % (CANVAS_WIDTH + 200);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  for (let i = -1; i < 3; i++) {
    const cx = i * 400 + cloudOffset;
    ctx.beginPath();
    ctx.arc(cx + 80, 50, 32, 0, Math.PI * 2);
    ctx.arc(cx + 120, 42, 40, 0, Math.PI * 2);
    ctx.arc(cx + 160, 48, 30, 0, Math.PI * 2);
    ctx.arc(cx + 190, 58, 22, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. Layer 0: 먼 산 및 흑석동 언덕 능선 (0.08배 패럴랙스)
  const hillOffset = -(playerWorldY * 0.8) % 360;
  ctx.fillStyle = '#64748b'; // 원경 청록-그레이 능선
  ctx.beginPath();
  ctx.moveTo(0, 160);
  for (let x = -360; x <= CANVAS_WIDTH + 360; x += 180) {
    const hx = x + hillOffset;
    ctx.quadraticCurveTo(hx + 90, 110, hx + 180, 145);
  }
  ctx.lineTo(CANVAS_WIDTH, 180);
  ctx.lineTo(0, 180);
  ctx.closePath();
  ctx.fill();

  // 3. Layer 1: 중앙대 캠퍼스 원경 빌딩 실루엣 (0.18배 패럴랙스)
  // 왼쪽 위에서 오른쪽 아래로 내려다보는 쿼터뷰에 맞추어 비스듬한 스카이라인 구성
  const bldgOffset = -(playerWorldY * 1.8) % 480;
  ctx.fillStyle = '#475569'; // 중경 슬레이트 그레이

  const bldgHeights = [65, 85, 50, 100, 70, 90, 60, 110];
  const bldgWidths = [45, 55, 40, 60, 50, 48, 42, 65];

  let currentBx = -480 + bldgOffset;
  let idx = 0;
  while (currentBx < CANVAS_WIDTH + 100) {
    const bw = bldgWidths[idx % bldgWidths.length];
    const bh = bldgHeights[idx % bldgHeights.length];
    const by = 165 - bh;

    // 빌딩 앞면
    ctx.fillStyle = idx % 2 === 0 ? '#475569' : '#334155';
    ctx.fillRect(currentBx, by, bw, bh);

    // 쿼터뷰 입체감을 위한 빌딩 오른쪽 옆면 (어두운 음영)
    const sideW = Math.round(bw * 0.28);
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(currentBx + bw, by);
    ctx.lineTo(currentBx + bw + sideW, by + 6);
    ctx.lineTo(currentBx + bw + sideW, 165);
    ctx.lineTo(currentBx + bw, 165);
    ctx.closePath();
    ctx.fill();

    // 빌딩 지붕 (빛을 받는 밝은 윗면)
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.moveTo(currentBx, by);
    ctx.lineTo(currentBx + sideW, by - 5);
    ctx.lineTo(currentBx + bw + sideW, by + 6);
    ctx.lineTo(currentBx + bw, by);
    ctx.closePath();
    ctx.fill();

    // 창문 불빛 픽셀 점들
    ctx.fillStyle = '#94a3b8';
    for (let r = by + 12; r < 155; r += 14) {
      for (let c = currentBx + 6; c < currentBx + bw - 6; c += 10) {
        if ((r + c) % 3 !== 0) {
          ctx.fillRect(c, r, 5, 6);
        }
      }
    }

    currentBx += bw + sideW + 16;
    idx++;
  }

  // 지평선 수목 띠 (숲과 캠퍼스 경계)
  ctx.fillStyle = '#1e3a1e';
  ctx.beginPath();
  ctx.moveTo(0, 160);
  for (let x = 0; x < CANVAS_WIDTH; x += 30) {
    ctx.lineTo(x + 15, 150 + (x % 20 === 0 ? -4 : 3));
    ctx.lineTo(x + 30, 160);
  }
  ctx.lineTo(CANVAS_WIDTH, 175);
  ctx.lineTo(0, 175);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
};
