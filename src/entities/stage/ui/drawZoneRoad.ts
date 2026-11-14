import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  ROAD_LEFT,
  ROAD_RIGHT,
} from '../../../shared/config/gameConfig';
import { project, ProjectedPoint } from '../lib/projection';
import { getZoneAt } from '../model/cauStage1';
import { StageZoneTheme } from '../model/types';

interface RoadSegment {
  relM0: number; // 시작 상대 미터
  relM1: number; // 끝 상대 미터
  pLeft0: ProjectedPoint;
  pRight0: ProjectedPoint;
  pLeft1: ProjectedPoint;
  pRight1: ProjectedPoint;
  worldM: number; // 실제 월드 미터
  theme: StageZoneTheme;
  fadeAlpha: number; // 구간 전환 페이드 알파 (0.0 ~ 1.0)
  prevTheme?: StageZoneTheme;
}

/**
 * 8개 테마별 도로 바닥, 인도, 연석 및 노면 마킹 렌더링
 */
export const drawZoneRoad = (
  ctx: CanvasRenderingContext2D,
  playerWorldY: number
): void => {
  ctx.save();

  // 1. 전체 바닥 베이스 (원경 잔디/녹지 공간)
  ctx.fillStyle = '#14532d'; // 짙은 캠퍼스 수목 녹색
  ctx.fillRect(0, 150, CANVAS_WIDTH, CANVAS_HEIGHT - 150);

  // 2. 도로 및 인도 세그먼트 생성 (플레이어 전방 약 50m ~ 후방 10m)
  // 1.5m 단위로 촘촘하게 쿼드 메쉬를 분할하여 부드러운 원근 투영 및 곡선, 페이드 구현
  const stepM = 1.5;
  const minRelM = -10;
  const maxRelM = 52;
  const segments: RoadSegment[] = [];

  for (let m = minRelM; m < maxRelM; m += stepM) {
    const m0 = m;
    const m1 = m + stepM;
    const wM = playerWorldY + m0;

    const pLeft0 = project(ROAD_LEFT, m0);
    const pRight0 = project(ROAD_RIGHT, m0);
    const pLeft1 = project(ROAD_LEFT, m1);
    const pRight1 = project(ROAD_RIGHT, m1);

    // 화면 밖 클리핑 (위/아래)
    if (Math.min(pLeft0.sy, pLeft1.sy) > CANVAS_HEIGHT + 30) continue;
    if (Math.max(pLeft0.sy, pLeft1.sy) < 140) continue;

    const currentZone = getZoneAt(wM);
    // 경계 10m 페이드 계산
    let fadeAlpha = 1.0;
    let prevTheme: StageZoneTheme | undefined;

    // 구간 진입 10m 이내일 때 이전 구간과 블렌딩
    const distFromStart = wM - currentZone.fromM;
    if (distFromStart < 10 && currentZone.fromM > 0) {
      fadeAlpha = Math.max(0, Math.min(1, distFromStart / 10));
      const prevZone = getZoneAt(currentZone.fromM - 1);
      prevTheme = prevZone.theme;
    }

    segments.push({
      relM0: m0,
      relM1: m1,
      pLeft0,
      pRight0,
      pLeft1,
      pRight1,
      worldM: wM,
      theme: currentZone.theme,
      fadeAlpha,
      prevTheme,
    });
  }

  // 3. 도로 양옆 인도 (Sidewalk) 및 지면 렌더링 (뒤에서부터 앞으로)
  for (let i = segments.length - 1; i >= 0; i--) {
    const s = segments[i];

    // 인도 좌/우 폭 (투영 스케일 반영)
    const sidewalkWidth = 260 * s.pLeft0.scale;

    // 왼쪽 인도
    drawSidewalkQuad(
      ctx,
      s.pLeft0.sx - sidewalkWidth,
      s.pLeft0.sy,
      s.pLeft0.sx,
      s.pLeft0.sy,
      s.pLeft1.sx,
      s.pLeft1.sy,
      s.pLeft1.sx - sidewalkWidth,
      s.pLeft1.sy,
      s.theme,
      'LEFT'
    );

    // 오른쪽 인도
    drawSidewalkQuad(
      ctx,
      s.pRight0.sx,
      s.pRight0.sy,
      s.pRight0.sx + sidewalkWidth,
      s.pRight0.sy,
      s.pRight1.sx + sidewalkWidth,
      s.pRight1.sy,
      s.pRight1.sx,
      s.pRight1.sy,
      s.theme,
      'RIGHT'
    );
  }

  // 4. 메인 도로 (Pavement / Road Surface) 렌더링
  for (let i = segments.length - 1; i >= 0; i--) {
    const s = segments[i];

    // 테마별 기본 아스팔트/보도블록 바닥색
    const surfaceColor = getRoadSurfaceColor(s.theme, s.worldM);

    ctx.fillStyle = surfaceColor;
    ctx.beginPath();
    ctx.moveTo(s.pLeft0.sx, s.pLeft0.sy);
    ctx.lineTo(s.pRight0.sx, s.pRight0.sy);
    ctx.lineTo(s.pRight1.sx, s.pRight1.sy);
    ctx.lineTo(s.pLeft1.sx, s.pLeft1.sy);
    ctx.closePath();
    ctx.fill();

    // 테마별 노면 텍스처 및 마킹 오버레이
    drawRoadThemeDetails(ctx, s);

    // 5. 3/4 쿼터뷰 입체 연석 (Curb) 그리기
    // 왼쪽 연석 (빛을 받는 윗면 밝음 + 오른쪽 입체면)
    draw3DCurb(
      ctx,
      s.pLeft0.sx,
      s.pLeft0.sy,
      s.pLeft1.sx,
      s.pLeft1.sy,
      s.pLeft0.scale,
      'LEFT'
    );

    // 오른쪽 연석 (도로와 인도의 단차)
    draw3DCurb(
      ctx,
      s.pRight0.sx,
      s.pRight0.sy,
      s.pRight1.sx,
      s.pRight1.sy,
      s.pRight0.scale,
      'RIGHT'
    );
  }

  ctx.restore();
};

/**
 * 테마별 메인 도로 기본 표면 색상
 */
const getRoadSurfaceColor = (theme: StageZoneTheme, worldM: number): string => {
  switch (theme) {
    case 'GATE_ENTRANCE':
      // 짙은 흑색 아스팔트 (0_100.png)
      return '#334155';
    case 'BETWEEN_BUILDINGS':
      // 차도 끝나고 회색 보도블록 보행로 (100_160.png)
      return (Math.floor(worldM * 2) % 2 === 0) ? '#64748b' : '#475569';
    case 'TREE_SQUARE':
      // 베이지/회색 격자 보도블록 광장 (160_200.png)
      return (Math.floor(worldM * 2) % 2 === 0) ? '#d6d3d1' : '#cbd5e1';
    case 'CAMPUS_UPHILL':
      // 캠퍼스 오르막 아스팔트 (200_300.png)
      return '#384252';
    case 'LIBRARY_STAIRS':
      // 도서관 긴 계단 (300_340.png: 디딤면과 챌면 교차)
      return (Math.floor(worldM * 3) % 2 === 0) ? '#cbd5e1' : '#94a3b8';
    case 'FOREST_SLOPE':
      // 숲길 어두운 아스팔트 (340_370.png)
      return '#283344';
    case 'BUILDING_SLOPE':
      // 건물 옆 비탈길 아스팔트 (370_450.png)
      return '#334155';
    case 'BUILDING_310':
      // 310관 앞 붉은 벽돌 보도 직선로 (450_500.png)
      return (Math.floor(worldM * 3) % 2 === 0) ? '#991b1b' : '#7f1d1d';
    default:
      return '#334155';
  }
};

/**
 * 테마별 노면 특수 마킹 렌더링 (중앙선, 횡단보도, 화살표, 계단 줄무늬, 천천히 글씨 등)
 */
const drawRoadThemeDetails = (ctx: CanvasRenderingContext2D, s: RoadSegment): void => {
  const m = s.worldM;
  const centerX0 = (s.pLeft0.sx + s.pRight0.sx) / 2;
  const centerX1 = (s.pLeft1.sx + s.pRight1.sx) / 2;
  const rWidth0 = s.pRight0.sx - s.pLeft0.sx;
  const rWidth1 = s.pRight1.sx - s.pLeft1.sx;

  switch (s.theme) {
    case 'GATE_ENTRANCE': {
      // 1. 0~25m 구간: 큼직한 흰 횡단보도 (0_100.png)
      if (m >= 8 && m <= 14) {
        ctx.fillStyle = '#f8fafc';
        const barCount = 7;
        for (let b = 0; b < barCount; b++) {
          const frac0 = (b + 0.5) / barCount;
          const barW0 = (rWidth0 / barCount) * 0.55;
          const bx0 = s.pLeft0.sx + rWidth0 * frac0 - barW0 / 2;

          const frac1 = (b + 0.5) / barCount;
          const barW1 = (rWidth1 / barCount) * 0.55;
          const bx1 = s.pLeft1.sx + rWidth1 * frac1 - barW1 / 2;

          ctx.beginPath();
          ctx.moveTo(bx0, s.pLeft0.sy);
          ctx.lineTo(bx0 + barW0, s.pLeft0.sy);
          ctx.lineTo(bx1 + barW1, s.pLeft1.sy);
          ctx.lineTo(bx1, s.pLeft1.sy);
          ctx.closePath();
          ctx.fill();
        }
      }

      // 2. 25~100m 구간: 노란 중앙 실선
      if (m > 24) {
        ctx.strokeStyle = '#facc15'; // 중앙선 노란색
        ctx.lineWidth = Math.max(2, 4 * s.pLeft0.scale);
        ctx.beginPath();
        ctx.moveTo(centerX0, s.pLeft0.sy);
        ctx.lineTo(centerX1, s.pLeft1.sy);
        ctx.stroke();
      }

      break;
    }

    case 'BETWEEN_BUILDINGS': {
      // 가운데 어두운 보도블록 띠 (100_160.png)
      const centerStripW0 = rWidth0 * 0.32;
      const centerStripW1 = rWidth1 * 0.32;
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(centerX0 - centerStripW0 / 2, s.pLeft0.sy);
      ctx.lineTo(centerX0 + centerStripW0 / 2, s.pLeft0.sy);
      ctx.lineTo(centerX1 + centerStripW1 / 2, s.pLeft1.sy);
      ctx.lineTo(centerX1 - centerStripW1 / 2, s.pLeft1.sy);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'TREE_SQUARE': {
      // 베이지 격자 광장 패턴 (160_200.png)
      ctx.strokeStyle = '#a8a29e';
      ctx.lineWidth = 1;
      const tileCols = 6;
      for (let c = 1; c < tileCols; c++) {
        const x0 = s.pLeft0.sx + (rWidth0 * c) / tileCols;
        const x1 = s.pLeft1.sx + (rWidth1 * c) / tileCols;
        ctx.beginPath();
        ctx.moveTo(x0, s.pLeft0.sy);
        ctx.lineTo(x1, s.pLeft1.sy);
        ctx.stroke();
      }
      break;
    }

    case 'CAMPUS_UPHILL': {
      // 1. 노란 중앙 점선 및 양쪽 흰 가장자리선 (200_300.png)
      if (Math.floor(m * 1.5) % 2 === 0) {
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = Math.max(2, 3.5 * s.pLeft0.scale);
        ctx.beginPath();
        ctx.moveTo(centerX0, s.pLeft0.sy);
        ctx.lineTo(centerX1, s.pLeft1.sy);
        ctx.stroke();
      }

      // 흰 가장자리선
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = Math.max(2, 3 * s.pLeft0.scale);
      ctx.beginPath();
      ctx.moveTo(s.pLeft0.sx + 12 * s.pLeft0.scale, s.pLeft0.sy);
      ctx.lineTo(s.pLeft1.sx + 12 * s.pLeft1.scale, s.pLeft1.sy);
      ctx.moveTo(s.pRight0.sx - 12 * s.pRight0.scale, s.pRight0.sy);
      ctx.lineTo(s.pRight1.sx - 12 * s.pRight1.scale, s.pRight1.sy);
      ctx.stroke();

      break;
    }

    case 'LIBRARY_STAIRS': {
      // 헐떡고개 긴 계단 단차 줄무늬 (300_340.png)
      // 300m 입구: 노란 점자블록 띠
      if (m >= 300 && m <= 304) {
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.moveTo(s.pLeft0.sx, s.pLeft0.sy);
        ctx.lineTo(s.pRight0.sx, s.pRight0.sy);
        ctx.lineTo(s.pRight1.sx, s.pRight1.sy);
        ctx.lineTo(s.pLeft1.sx, s.pLeft1.sy);
        ctx.closePath();
        ctx.fill();

        // 점자 돌기 점들
        ctx.fillStyle = '#ca8a04';
        for (let bx = s.pLeft0.sx + 15; bx < s.pRight0.sx - 15; bx += 18 * s.pLeft0.scale) {
          ctx.beginPath();
          ctx.arc(bx, (s.pLeft0.sy + s.pLeft1.sy) / 2, 2.5 * s.pLeft0.scale, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // 계단 코(Nosing) 하이라이트 & 챌면 그림자
        ctx.strokeStyle = '#f1f5f9'; // 디딤판 모서리 흰색 라인
        ctx.lineWidth = Math.max(1, 2 * s.pLeft0.scale);
        ctx.beginPath();
        ctx.moveTo(s.pLeft0.sx, s.pLeft0.sy);
        ctx.lineTo(s.pRight0.sx, s.pRight0.sy);
        ctx.stroke();

        ctx.strokeStyle = '#475569'; // 챌면 하단 음영
        ctx.beginPath();
        ctx.moveTo(s.pLeft1.sx, s.pLeft1.sy);
        ctx.lineTo(s.pRight1.sx, s.pRight1.sy);
        ctx.stroke();
      }
      break;
    }

    case 'FOREST_SLOPE': {
      // 오른쪽으로 휘어지는 숲길 도로 (340_370.png)
      // 흰 가장자리 실선
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = Math.max(2, 3 * s.pLeft0.scale);
      ctx.beginPath();
      ctx.moveTo(s.pLeft0.sx + 10 * s.pLeft0.scale, s.pLeft0.sy);
      ctx.lineTo(s.pLeft1.sx + 10 * s.pLeft1.scale, s.pLeft1.sy);
      ctx.moveTo(s.pRight0.sx - 10 * s.pRight0.scale, s.pRight0.sy);
      ctx.lineTo(s.pRight1.sx - 10 * s.pRight1.scale, s.pRight1.sy);
      ctx.stroke();
      break;
    }

    case 'BUILDING_SLOPE': {
      // 건물 옆 비탈길 (370_450.png)
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = Math.max(2, 3 * s.pLeft0.scale);
      ctx.beginPath();
      ctx.moveTo(s.pLeft0.sx + 8 * s.pLeft0.scale, s.pLeft0.sy);
      ctx.lineTo(s.pLeft1.sx + 8 * s.pLeft1.scale, s.pLeft1.sy);
      ctx.moveTo(s.pRight0.sx - 8 * s.pRight0.scale, s.pRight0.sy);
      ctx.lineTo(s.pRight1.sx - 8 * s.pRight1.scale, s.pRight1.sy);
      ctx.stroke();
      break;
    }

    case 'BUILDING_310': {
      // 붉은 벽돌 보도 세로 격자선 (450_500.png)
      ctx.strokeStyle = '#450a0a';
      ctx.lineWidth = 1;
      const brickCols = 8;
      for (let c = 1; c < brickCols; c++) {
        const x0 = s.pLeft0.sx + (rWidth0 * c) / brickCols;
        const x1 = s.pLeft1.sx + (rWidth1 * c) / brickCols;
        ctx.beginPath();
        ctx.moveTo(x0, s.pLeft0.sy);
        ctx.lineTo(x1, s.pLeft1.sy);
        ctx.stroke();
      }
      break;
    }
  }
};

/**
 * 3/4 쿼터뷰 입체 연석 (Curb) 렌더링 (윗면 밝음 + 측면 어두움으로 3D 높이감 표현)
 */
const draw3DCurb = (
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  scale: number,
  side: 'LEFT' | 'RIGHT'
): void => {
  const curbHeight = Math.max(4, 7 * scale);
  const curbWidth = Math.max(5, 9 * scale) * (side === 'LEFT' ? -1 : 1);

  // 1. 연석 윗면 (빛을 받아 밝은 톤)
  ctx.fillStyle = '#94a3b8';
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x0 + curbWidth, y0);
  ctx.lineTo(x1 + curbWidth, y1);
  ctx.lineTo(x1, y1);
  ctx.closePath();
  ctx.fill();

  // 2. 연석 측면 (도로와 맞닿는 그림자 면)
  ctx.fillStyle = side === 'LEFT' ? '#64748b' : '#334155';
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x0, y0 + curbHeight);
  ctx.lineTo(x1, y1 + curbHeight);
  ctx.lineTo(x1, y1);
  ctx.closePath();
  ctx.fill();
};

/**
 * 인도 (Sidewalk) 사각 영역 렌더링
 */
const drawSidewalkQuad = (
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  theme: StageZoneTheme,
  side: 'LEFT' | 'RIGHT'
): void => {
  let fillColor = '#64748b';

  switch (theme) {
    case 'GATE_ENTRANCE':
      fillColor = side === 'LEFT' ? '#94a3b8' : '#15803d'; // 왼쪽 회색 보도블록, 오른쪽 잔디밭 (0_100.png)
      break;
    case 'BETWEEN_BUILDINGS':
      fillColor = side === 'LEFT' ? '#475569' : '#166534'; // 짙은 녹음 (100_160.png)
      break;
    case 'TREE_SQUARE':
      fillColor = '#cbd5e1'; // 넓은 광장 바닥 (160_200.png)
      break;
    case 'CAMPUS_UPHILL':
      fillColor = side === 'LEFT' ? '#64748b' : '#166534'; // 오른쪽 비탈 잔디밭 (200_300.png)
      break;
    case 'LIBRARY_STAIRS':
      fillColor = side === 'LEFT' ? '#475569' : '#1e3a1e'; // 왼쪽 유리 구조물 바닥, 오른쪽 수풀 (300_340.png)
      break;
    case 'FOREST_SLOPE':
      fillColor = side === 'LEFT' ? '#14532d' : '#b45309'; // 오른쪽 붉은 벽돌 화단 (340_370.png)
      break;
    case 'BUILDING_SLOPE':
      fillColor = side === 'LEFT' ? '#94a3b8' : '#451a03'; // 오른쪽 어두운 목재 데크 (370_450.png)
      break;
    case 'BUILDING_310':
      fillColor = side === 'LEFT' ? '#a8a29e' : '#78350f'; // 310관 앞 광장 & 화단 (450_500.png)
      break;
  }

  ctx.fillStyle = fillColor;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.closePath();
  ctx.fill();
};
