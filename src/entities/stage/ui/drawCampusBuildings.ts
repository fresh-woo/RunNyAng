import { project, SHADOW_CONFIG } from '../lib/projection';
import { getZoneAt } from '../model/cauStage1';
import { ROAD_LEFT, ROAD_RIGHT } from '../../../shared/config/gameConfig';

/**
 * 3/4 쿼터뷰 입체 건물(앞면+오른쪽옆면+지붕) 및 테마별 환경 소품 렌더링
 * 빛 방향: 왼쪽 위 -> 그림자 방향: 오른쪽 아래
 */
export const drawCampusBuildings = (
  ctx: CanvasRenderingContext2D,
  playerWorldY: number
): void => {
  ctx.save();

  // 플레이어 시야 범위 (-10m ~ +52m) 내의 구간별 소품 및 랜드마크 구조물 배치
  // 6m 단위로 체크하여 각 위치의 테마에 맞는 건물과 가로수, 소품 렌더링
  const stepM = 8;
  const minM = Math.floor((playerWorldY - 10) / stepM) * stepM;
  const maxM = Math.ceil((playerWorldY + 54) / stepM) * stepM;

  // 원경(깊은 곳, relMeters가 큰 것)부터 근경 순서로 렌더링
  for (let m = maxM; m >= minM; m -= stepM) {
    if (m < 0 || m > 520) continue;
    const relM = m - playerWorldY;
    const zone = getZoneAt(m);

    // 투영 지점
    const pLeft = project(ROAD_LEFT - 30, relM);
    const pRight = project(ROAD_RIGHT + 30, relM);

    // 화면 밖이면 스킵
    if (pLeft.sy < 130 || pLeft.sy > 560) continue;

    // 테마별 환경 소품 및 건물 렌더링
    switch (zone.theme) {
      case 'GATE_ENTRANCE': {
        // [0 ~ 100m] 0_100.png: 정문 안 진입로
        // 왼쪽: 102관 약학대학 R&D센터 유리 커튼월 현대식 건물 (앞면+오른쪽옆면+지붕)
        if (m % 16 === 0) {
          draw3DModernGlassBuilding(
            ctx,
            pLeft.sx - 80 * pLeft.scale,
            pLeft.sy,
            120 * pLeft.scale,
            150 * pLeft.scale,
            pLeft.scale,
            '102관 R&D센터'
          );
        }

        // 왼쪽 인도 볼라드 (노란색/검은색 볼라드)
        drawBollard(ctx, pLeft.sx + 10 * pLeft.scale, pLeft.sy, pLeft.scale, (m % 16 === 0) ? '#eab308' : '#0f172a');

        // 오른쪽: 가로수 줄 + 넓은 잔디밭 + 캠퍼스 벤치 (0_100.png)
        drawCampusTree(ctx, pRight.sx + 45 * pRight.scale, pRight.sy, pRight.scale, 'OAK');
        if (m % 16 === 8) {
          drawCampusBench(ctx, pRight.sx + 75 * pRight.scale, pRight.sy, pRight.scale);
        }
        break;
      }

      case 'BETWEEN_BUILDINGS': {
        // [100 ~ 160m] 100_160.png: 건물 사이 보행로
        // 왼쪽: 짙은 돌벽 건물 모퉁이와 그늘진 아케이드
        if (m % 16 === 0) {
          draw3DStoneBuilding(
            ctx,
            pLeft.sx - 70 * pLeft.scale,
            pLeft.sy,
            110 * pLeft.scale,
            130 * pLeft.scale,
            pLeft.scale
          );
        }
        // 왼쪽: 파란 표지 기둥 (100_160.png)
        if (m === 112 || m === 136) {
          drawBlueSignPole(ctx, pLeft.sx + 5 * pLeft.scale, pLeft.sy, pLeft.scale);
        }

        // 양옆 짙은 가로수 그늘
        drawCampusTree(ctx, pLeft.sx - 15 * pLeft.scale, pLeft.sy, pLeft.scale, 'DENSE');
        drawCampusTree(ctx, pRight.sx + 35 * pRight.scale, pRight.sy, pRight.scale, 'DENSE');
        break;
      }

      case 'TREE_SQUARE': {
        // [160 ~ 200m] 160_200.png: 나무 광장
        // 왼쪽/오른쪽: 키 큰 활엽수 빽빽, 둥근 덤불, 낮은 계단 금속 난간
        drawCampusTree(ctx, pLeft.sx - 40 * pLeft.scale, pLeft.sy, pLeft.scale, 'TALL');
        drawRoundBush(ctx, pLeft.sx - 10 * pLeft.scale, pLeft.sy, pLeft.scale);

        drawCampusTree(ctx, pRight.sx + 50 * pRight.scale, pRight.sy, pRight.scale, 'TALL');
        drawRoundBush(ctx, pRight.sx + 20 * pRight.scale, pRight.sy, pRight.scale);

        // 낮은 계단 난간 (160_200.png)
        if (m % 16 === 0) {
          drawMetalRailing(ctx, pLeft.sx - 25 * pLeft.scale, pLeft.sy, pLeft.scale);
        }
        break;
      }

      case 'CAMPUS_UPHILL': {
        // [200 ~ 300m] 200_300.png: 캠퍼스 오르막 차도
        // 왼쪽: 붉은 벽돌 강의동 건물 + 가로수
        if (m % 24 === 0) {
          draw3DRedBrickBuilding(
            ctx,
            pLeft.sx - 85 * pLeft.scale,
            pLeft.sy,
            120 * pLeft.scale,
            140 * pLeft.scale,
            pLeft.scale
          );
        }
        drawCampusTree(ctx, pLeft.sx - 20 * pLeft.scale, pLeft.sy, pLeft.scale, 'OAK');

        // 오른쪽: 소나무 & 덤불 비탈 (200_300.png)
        drawPineTree(ctx, pRight.sx + 45 * pRight.scale, pRight.sy, pRight.scale);
        drawRoundBush(ctx, pRight.sx + 15 * pRight.scale, pRight.sy, pRight.scale);

        // 공사 안전펜스 / 라바콘 (200_300.png)
        if (m >= 230 && m <= 260 && m % 12 === 0) {
          drawConstructionFence(ctx, pLeft.sx + 15 * pLeft.scale, pLeft.sy, pLeft.scale);
        }
        break;
      }

      case 'LIBRARY_STAIRS': {
        // [300 ~ 340m] 300_340.png: 도서관 옆 긴 계단
        // 왼쪽: 경사형 유리 지붕 에스컬레이터/엘리베이터 구조물
        drawSlopedGlassCanopy(
          ctx,
          pLeft.sx - 45 * pLeft.scale,
          pLeft.sy,
          70 * pLeft.scale,
          90 * pLeft.scale,
          pLeft.scale
        );

        // 오른쪽: 돌담 난간 + 우거진 수풀 + 클래식 가로등 (300_340.png)
        drawStoneWall(ctx, pRight.sx + 10 * pRight.scale, pRight.sy, pRight.scale);
        drawCampusTree(ctx, pRight.sx + 40 * pRight.scale, pRight.sy, pRight.scale, 'DENSE');
        if (m % 16 === 0) {
          drawStreetLamp(ctx, pRight.sx + 20 * pRight.scale, pRight.sy, pRight.scale);
        }
        break;
      }

      case 'FOREST_SLOPE': {
        // [340 ~ 370m] 340_370.png: 숲길 오르막
        // 양쪽 짙은 초록 숲과 덤불, 오른쪽 붉은 벽돌 화단 경계
        drawCampusTree(ctx, pLeft.sx - 35 * pLeft.scale, pLeft.sy, pLeft.scale, 'DENSE');
        drawRoundBush(ctx, pLeft.sx - 10 * pLeft.scale, pLeft.sy, pLeft.scale);

        drawBrickFlowerBed(ctx, pRight.sx + 15 * pRight.scale, pRight.sy, pRight.scale);
        drawCampusTree(ctx, pRight.sx + 50 * pRight.scale, pRight.sy, pRight.scale, 'OAK');
        break;
      }

      case 'BUILDING_SLOPE': {
        // [370 ~ 450m] 370_450.png: 건물 옆 비탈길
        // 왼쪽: 거대한 유리 커튼월 현대식 건물 + 철제 난간 + 풀 화단
        if (m % 24 === 0) {
          draw3DModernGlassBuilding(
            ctx,
            pLeft.sx - 80 * pLeft.scale,
            pLeft.sy,
            120 * pLeft.scale,
            160 * pLeft.scale,
            pLeft.scale
          );
        }
        drawMetalRailing(ctx, pLeft.sx - 15 * pLeft.scale, pLeft.sy, pLeft.scale);

        // 오른쪽: 어두운 목재 데크 테라스 + 검은 철제 펜스 + 가로등 + 큰 가로수 (370_450.png)
        drawWoodenDeck(ctx, pRight.sx + 10 * pRight.scale, pRight.sy, pRight.scale);
        drawCampusTree(ctx, pRight.sx + 55 * pRight.scale, pRight.sy, pRight.scale, 'TALL');
        if (m % 20 === 0) {
          drawStreetLamp(ctx, pRight.sx + 25 * pRight.scale, pRight.sy, pRight.scale);
        }
        break;
      }

      case 'BUILDING_310': {
        // [450 ~ 500m] 450_500.png: 310관 앞 마지막 직선
        // 오른쪽: 캠퍼스 현수막 게시대와 화단
        drawBannerFence(ctx, pRight.sx + 15 * pRight.scale, pRight.sy, pRight.scale);
        drawCampusTree(ctx, pRight.sx + 50 * pRight.scale, pRight.sy, pRight.scale, 'WINTER');

        // 왼쪽: 광장과 앙상한 나무
        drawCampusTree(ctx, pLeft.sx - 35 * pLeft.scale, pLeft.sy, pLeft.scale, 'WINTER');

        // 500m 지점: 회색 화강암 310관 입구 거대 게이트와 "310" 금색 로고
        if (m >= 490) {
          draw310GrandGate(
            ctx,
            (pLeft.sx + pRight.sx) / 2,
            pLeft.sy - 20 * pLeft.scale,
            pLeft.scale
          );
        }
        break;
      }
    }
  }

  ctx.restore();
};

/**
 * 3/4 쿼터뷰 입체 현대식 유리 빌딩 (102관 약학대학 R&D 센터 등)
 * 앞면: 밝은 청록 유리창 격자 / 옆면: 어두운 섀도우 / 지붕: 밝은 하이라이트
 */
const draw3DModernGlassBuilding = (
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  w: number,
  h: number,
  scale: number,
  title?: string
): void => {
  ctx.save();
  const sideW = w * 0.35;
  const roofH = 14 * scale;

  // 1. 바닥 그림자 (오른쪽 아래로 투영)
  ctx.fillStyle = SHADOW_CONFIG.color;
  ctx.beginPath();
  ctx.moveTo(x, baseY);
  ctx.lineTo(x + w + sideW + 20 * scale, baseY + 8 * scale);
  ctx.lineTo(x + w + sideW, baseY + 18 * scale);
  ctx.lineTo(x - 10 * scale, baseY + 14 * scale);
  ctx.closePath();
  ctx.fill();

  // 2. 건물 정면 (Front Face)
  const frontGradient = ctx.createLinearGradient(x, baseY - h, x + w, baseY);
  frontGradient.addColorStop(0, '#0284c7');
  frontGradient.addColorStop(1, '#0369a1');
  ctx.fillStyle = frontGradient;
  ctx.fillRect(x, baseY - h, w, h);

  // 유리창 프레임 격자 (Pixel Art 스타일)
  ctx.strokeStyle = '#bae6fd';
  ctx.lineWidth = Math.max(1, 1.5 * scale);
  const rows = 5;
  const cols = 4;
  for (let r = 1; r < rows; r++) {
    const gy = baseY - h + (h * r) / rows;
    ctx.beginPath();
    ctx.moveTo(x, gy);
    ctx.lineTo(x + w, gy);
    ctx.stroke();
  }
  for (let c = 1; c < cols; c++) {
    const gx = x + (w * c) / cols;
    ctx.beginPath();
    ctx.moveTo(gx, baseY - h);
    ctx.lineTo(gx, baseY);
    ctx.stroke();
  }

  // 3. 건물 오른쪽 옆면 (Right Shadow Face - 쿼터뷰 입체감의 핵심)
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.moveTo(x + w, baseY - h);
  ctx.lineTo(x + w + sideW, baseY - h + roofH);
  ctx.lineTo(x + w + sideW, baseY + roofH);
  ctx.lineTo(x + w, baseY);
  ctx.closePath();
  ctx.fill();

  // 4. 건물 지붕 (Top Face / Roof - 빛을 받아 가장 밝음)
  ctx.fillStyle = '#7dd3fc';
  ctx.beginPath();
  ctx.moveTo(x, baseY - h);
  ctx.lineTo(x + sideW, baseY - h - roofH);
  ctx.lineTo(x + w + sideW, baseY - h + roofH);
  ctx.lineTo(x + w, baseY - h);
  ctx.closePath();
  ctx.fill();

  // 건물 라벨
  if (title && scale > 0.7) {
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(11 * scale)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(title, x + w / 2, baseY - h + 20 * scale);
  }

  ctx.restore();
};

/**
 * 3/4 쿼터뷰 붉은 벽돌 건물 (104관 등)
 */
const draw3DRedBrickBuilding = (
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  w: number,
  h: number,
  scale: number
): void => {
  ctx.save();
  const sideW = w * 0.35;
  const roofH = 12 * scale;

  // 바닥 그림자
  ctx.fillStyle = SHADOW_CONFIG.color;
  ctx.beginPath();
  ctx.moveTo(x, baseY);
  ctx.lineTo(x + w + sideW + 15 * scale, baseY + 6 * scale);
  ctx.lineTo(x + w + sideW, baseY + 16 * scale);
  ctx.lineTo(x - 8 * scale, baseY + 12 * scale);
  ctx.closePath();
  ctx.fill();

  // 앞면 (붉은 벽돌 톤)
  ctx.fillStyle = '#991b1b';
  ctx.fillRect(x, baseY - h, w, h);

  // 창문들
  ctx.fillStyle = '#f8fafc';
  for (let r = baseY - h + 18 * scale; r < baseY - 15 * scale; r += 26 * scale) {
    for (let c = x + 12 * scale; c < x + w - 12 * scale; c += 22 * scale) {
      ctx.fillRect(c, r, 12 * scale, 16 * scale);
    }
  }

  // 오른쪽 옆면 (어두운 벽돌 섀도우)
  ctx.fillStyle = '#450a0a';
  ctx.beginPath();
  ctx.moveTo(x + w, baseY - h);
  ctx.lineTo(x + w + sideW, baseY - h + roofH);
  ctx.lineTo(x + w + sideW, baseY + roofH);
  ctx.lineTo(x + w, baseY);
  ctx.closePath();
  ctx.fill();

  // 지붕
  ctx.fillStyle = '#b91c1c';
  ctx.beginPath();
  ctx.moveTo(x, baseY - h);
  ctx.lineTo(x + sideW, baseY - h - roofH);
  ctx.lineTo(x + w + sideW, baseY - h + roofH);
  ctx.lineTo(x + w, baseY - h);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
};

/**
 * 3/4 쿼터뷰 화강암 석벽 건물
 */
const draw3DStoneBuilding = (
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  w: number,
  h: number,
  scale: number
): void => {
  ctx.save();
  const sideW = w * 0.32;
  const roofH = 10 * scale;

  // 앞면
  ctx.fillStyle = '#64748b';
  ctx.fillRect(x, baseY - h, w, h);

  // 오른쪽 옆면
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.moveTo(x + w, baseY - h);
  ctx.lineTo(x + w + sideW, baseY - h + roofH);
  ctx.lineTo(x + w + sideW, baseY + roofH);
  ctx.lineTo(x + w, baseY);
  ctx.closePath();
  ctx.fill();

  // 지붕
  ctx.fillStyle = '#94a3b8';
  ctx.beginPath();
  ctx.moveTo(x, baseY - h);
  ctx.lineTo(x + sideW, baseY - h - roofH);
  ctx.lineTo(x + w + sideW, baseY - h + roofH);
  ctx.lineTo(x + w, baseY - h);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
};

/**
 * 3/4 쿼터뷰 캠퍼스 가로수 (OAK, PINE, TALL, DENSE, WINTER)
 */
const drawCampusTree = (
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  scale: number,
  type: 'OAK' | 'PINE' | 'TALL' | 'DENSE' | 'WINTER'
): void => {
  ctx.save();

  // 1. 나무 바닥 타원 그림자 (오른쪽 아래로 투영)
  ctx.fillStyle = SHADOW_CONFIG.color;
  ctx.beginPath();
  ctx.ellipse(
    x + SHADOW_CONFIG.offsetX * scale,
    baseY + SHADOW_CONFIG.offsetY * scale,
    22 * scale,
    9 * scale,
    0.2,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // 2. 나무 기둥 (Trunk)
  const trunkW = 10 * scale;
  const trunkH = (type === 'TALL' ? 55 : 35) * scale;
  ctx.fillStyle = '#78350f';
  ctx.fillRect(x - trunkW / 2, baseY - trunkH, trunkW, trunkH);

  // 기둥 오른쪽 옆면 음영
  ctx.fillStyle = '#451a03';
  ctx.fillRect(x, baseY - trunkH, trunkW / 2, trunkH);

  // 3. 수관 (Canopy)
  const topY = baseY - trunkH;
  if (type === 'WINTER') {
    // 앙상한 겨울 나뭇가지 (450_500.png)
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = Math.max(1.5, 2.5 * scale);
    ctx.beginPath();
    ctx.moveTo(x, topY);
    ctx.lineTo(x - 20 * scale, topY - 30 * scale);
    ctx.moveTo(x, topY);
    ctx.lineTo(x + 20 * scale, topY - 35 * scale);
    ctx.moveTo(x, topY + 10 * scale);
    ctx.lineTo(x - 25 * scale, topY - 10 * scale);
    ctx.stroke();
    ctx.restore();
    return;
  }

  // 잎사귀 층 (Lush green layers)
  const colors =
    type === 'DENSE'
      ? ['#14532d', '#166534', '#15803d']
      : ['#15803d', '#16a34a', '#4ade80'];

  // 뒤쪽/오른쪽 어두운 잎
  ctx.fillStyle = colors[0];
  ctx.beginPath();
  ctx.arc(x + 5 * scale, topY - 15 * scale, 32 * scale, 0, Math.PI * 2);
  ctx.fill();

  // 중간 잎
  ctx.fillStyle = colors[1];
  ctx.beginPath();
  ctx.arc(x, topY - 25 * scale, 28 * scale, 0, Math.PI * 2);
  ctx.fill();

  // 왼쪽 위 하이라이트 잎 (빛 받는 면)
  ctx.fillStyle = colors[2];
  ctx.beginPath();
  ctx.arc(x - 8 * scale, topY - 32 * scale, 20 * scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};

/**
 * 소나무 렌더링
 */
const drawPineTree = (
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  scale: number
): void => {
  ctx.save();
  // 기둥
  ctx.fillStyle = '#78350f';
  ctx.fillRect(x - 4 * scale, baseY - 40 * scale, 8 * scale, 40 * scale);

  // 원뿔형 잎사귀 3단
  const y0 = baseY - 20 * scale;
  for (let layer = 0; layer < 3; layer++) {
    const ly = y0 - layer * 20 * scale;
    const lw = (30 - layer * 6) * scale;
    ctx.fillStyle = layer === 2 ? '#16a34a' : '#14532d';
    ctx.beginPath();
    ctx.moveTo(x, ly - 22 * scale);
    ctx.lineTo(x + lw, ly);
    ctx.lineTo(x - lw, ly);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
};

/**
 * 둥근 화단 덤불
 */
const drawRoundBush = (
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  scale: number
): void => {
  ctx.save();
  ctx.fillStyle = SHADOW_CONFIG.color;
  ctx.beginPath();
  ctx.ellipse(x + 4 * scale, baseY + 2 * scale, 16 * scale, 6 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#166534';
  ctx.beginPath();
  ctx.arc(x, baseY - 10 * scale, 13 * scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.arc(x - 4 * scale, baseY - 13 * scale, 8 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

/**
 * 볼라드 렌더링 (0_100.png)
 */
const drawBollard = (
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  scale: number,
  color: string
): void => {
  ctx.save();
  // 그림자
  ctx.fillStyle = SHADOW_CONFIG.color;
  ctx.beginPath();
  ctx.ellipse(x + 3 * scale, baseY + 2 * scale, 6 * scale, 3 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  // 기둥
  const bw = 6 * scale;
  const bh = 18 * scale;
  ctx.fillStyle = color;
  ctx.fillRect(x - bw / 2, baseY - bh, bw, bh);

  // 윗면 둥근 캡
  ctx.beginPath();
  ctx.arc(x, baseY - bh, bw / 2, Math.PI, 0);
  ctx.fill();
  ctx.restore();
};

/**
 * 캠퍼스 목재 벤치 (0_100.png)
 */
const drawCampusBench = (
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  scale: number
): void => {
  ctx.save();
  const bw = 36 * scale;
  const bh = 16 * scale;

  // 그림자
  ctx.fillStyle = SHADOW_CONFIG.color;
  ctx.fillRect(x - 4 * scale, baseY, bw + 10 * scale, 6 * scale);

  // 등받이 & 좌반 (목재 톤)
  ctx.fillStyle = '#b45309';
  ctx.fillRect(x, baseY - bh, bw, 6 * scale);
  ctx.fillRect(x, baseY - bh / 2, bw, 6 * scale);

  // 다리 (철제)
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(x + 4 * scale, baseY - bh / 2, 3 * scale, bh / 2);
  ctx.fillRect(x + bw - 7 * scale, baseY - bh / 2, 3 * scale, bh / 2);
  ctx.restore();
};

/**
 * 파란 표지 기둥 (100_160.png)
 */
const drawBlueSignPole = (
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  scale: number
): void => {
  ctx.save();
  const pw = 8 * scale;
  const ph = 32 * scale;
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(x - pw / 2, baseY - ph, pw, ph);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(x - pw / 2, baseY - ph, pw / 2, ph);
  ctx.restore();
};

/**
 * 도서관 옆 경사 유리 지붕 구조물 (300_340.png)
 */
const drawSlopedGlassCanopy = (
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  w: number,
  h: number,
  scale: number
): void => {
  ctx.save();
  // 그림자
  ctx.fillStyle = SHADOW_CONFIG.color;
  ctx.fillRect(x, baseY, w + 15 * scale, 10 * scale);

  // 경사 유리 지붕
  const glassGrad = ctx.createLinearGradient(x, baseY - h, x + w, baseY);
  glassGrad.addColorStop(0, 'rgba(186, 230, 253, 0.85)');
  glassGrad.addColorStop(1, 'rgba(2, 132, 199, 0.7)');
  ctx.fillStyle = glassGrad;
  ctx.beginPath();
  ctx.moveTo(x, baseY - h);
  ctx.lineTo(x + w, baseY - h * 0.4);
  ctx.lineTo(x + w, baseY);
  ctx.lineTo(x, baseY - h * 0.6);
  ctx.closePath();
  ctx.fill();

  // 철제 프레임 라인
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(1, 1.8 * scale);
  ctx.stroke();
  ctx.restore();
};

/**
 * 돌담 난간 (300_340.png)
 */
const drawStoneWall = (
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  scale: number
): void => {
  ctx.save();
  ctx.fillStyle = '#64748b';
  ctx.fillRect(x, baseY - 20 * scale, 18 * scale, 20 * scale);
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(x, baseY - 24 * scale, 22 * scale, 5 * scale);
  ctx.restore();
};

/**
 * 클래식 가로등 (300_340.png, 370_450.png)
 */
const drawStreetLamp = (
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  scale: number
): void => {
  ctx.save();
  const lh = 55 * scale;
  // 기둥
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(x - 2 * scale, baseY - lh, 4 * scale, lh);

  // 램프 갓 (빛남)
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(x, baseY - lh, 7 * scale, 0, Math.PI * 2);
  ctx.fill();

  // 조명 은은한 글로우
  ctx.fillStyle = 'rgba(254, 240, 138, 0.25)';
  ctx.beginPath();
  ctx.arc(x, baseY - lh, 16 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

/**
 * 금속 난간 (160_200.png, 370_450.png)
 */
const drawMetalRailing = (
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  scale: number
): void => {
  ctx.save();
  const rw = 40 * scale;
  const rh = 18 * scale;
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = Math.max(1, 2 * scale);

  ctx.beginPath();
  ctx.moveTo(x, baseY - rh);
  ctx.lineTo(x + rw, baseY - rh);
  ctx.moveTo(x + 5 * scale, baseY - rh);
  ctx.lineTo(x + 5 * scale, baseY);
  ctx.moveTo(x + rw - 5 * scale, baseY - rh);
  ctx.lineTo(x + rw - 5 * scale, baseY);
  ctx.stroke();
  ctx.restore();
};

/**
 * 공사 안전펜스 (200_300.png)
 */
const drawConstructionFence = (
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  scale: number
): void => {
  ctx.save();
  const fw = 42 * scale;
  const fh = 20 * scale;

  ctx.fillStyle = '#eab308'; // 안전 노란색
  ctx.fillRect(x, baseY - fh, fw, fh);

  // 검은 대각선 줄무늬 (안전제일 테이프)
  ctx.fillStyle = '#0f172a';
  for (let sx = x; sx < x + fw; sx += 12 * scale) {
    ctx.beginPath();
    ctx.moveTo(sx, baseY);
    ctx.lineTo(sx + 6 * scale, baseY - fh);
    ctx.lineTo(sx + 10 * scale, baseY - fh);
    ctx.lineTo(sx + 4 * scale, baseY);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
};

/**
 * 붉은 벽돌 화단 경계 (340_370.png)
 */
const drawBrickFlowerBed = (
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  scale: number
): void => {
  ctx.save();
  ctx.fillStyle = '#b45309';
  ctx.fillRect(x, baseY - 8 * scale, 35 * scale, 8 * scale);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(x, baseY - 10 * scale, 35 * scale, 3 * scale);
  ctx.restore();
};

/**
 * 목재 데크 테라스 (370_450.png)
 */
const drawWoodenDeck = (
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  scale: number
): void => {
  ctx.save();
  const dw = 45 * scale;
  const dh = 15 * scale;
  ctx.fillStyle = '#451a03';
  ctx.fillRect(x, baseY - dh, dw, dh);
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 1;
  for (let ly = baseY - dh; ly < baseY; ly += 5 * scale) {
    ctx.beginPath();
    ctx.moveTo(x, ly);
    ctx.lineTo(x + dw, ly);
    ctx.stroke();
  }
  ctx.restore();
};

/**
 * 캠퍼스 현수막 게시대 (450_500.png)
 */
const drawBannerFence = (
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  scale: number
): void => {
  ctx.save();
  const bw = 50 * scale;
  const bh = 22 * scale;
  // 지지대
  ctx.fillStyle = '#334155';
  ctx.fillRect(x, baseY - bh, 3 * scale, bh);
  ctx.fillRect(x + bw, baseY - bh, 3 * scale, bh);

  // 보라색/흰색 현수막
  ctx.fillStyle = '#7c3aed';
  ctx.fillRect(x + 3 * scale, baseY - bh + 3 * scale, bw - 3 * scale, 14 * scale);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + 5 * scale, baseY - bh + 5 * scale, bw - 7 * scale, 3 * scale);
  ctx.restore();
};

/**
 * 310관 (100주년 기념관) 거대 랜드마크 게이트 & 금색 "310" 로고 (450_500.png)
 */
const draw310GrandGate = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  baseY: number,
  scale: number
): void => {
  ctx.save();
  const gw = 180 * scale;
  const gh = 90 * scale;
  const x = centerX - gw / 2;

  // 1. 회색 화강암 거대 게이트 (310관 입구 상징)
  ctx.fillStyle = '#475569';
  ctx.fillRect(x, baseY - gh, gw, gh);

  // 기둥 좌우 음영
  ctx.fillStyle = '#334155';
  ctx.fillRect(x, baseY - gh, 30 * scale, gh);
  ctx.fillRect(x + gw - 30 * scale, baseY - gh, 30 * scale, gh);

  // 상단 캐노피
  ctx.fillStyle = '#64748b';
  ctx.fillRect(x - 10 * scale, baseY - gh - 8 * scale, gw + 20 * scale, 12 * scale);

  // 2. 금색 찬란한 "310" 입체 로고!
  ctx.fillStyle = '#eab308';
  ctx.font = `900 ${Math.round(28 * scale)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 6 * scale;
  ctx.shadowOffsetX = 2 * scale;
  ctx.shadowOffsetY = 3 * scale;
  ctx.fillText('310', centerX, baseY - gh + 35 * scale);

  // 서브 타이틀: 100주년 기념관
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(11 * scale)}px sans-serif`;
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.fillText('100주년 기념관 (도착)', centerX, baseY - gh + 52 * scale);

  ctx.restore();
};
