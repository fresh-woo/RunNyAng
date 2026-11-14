import {
  CANVAS_HEIGHT,
} from '../../../shared/config/gameConfig';
import { StageObject } from '../model/types';
import { GameAssets } from '../../../shared/lib/assetLoader';
import { project, SHADOW_CONFIG } from '../lib/projection';
import { drawParallaxSky } from './drawParallaxSky';
import { drawZoneRoad } from './drawZoneRoad';
import { drawCampusBuildings } from './drawCampusBuildings';
import { Player } from '../../player/model/types';
import { drawPlayer } from '../../player/ui/drawPlayer';

/**
 * 캠퍼스 배경 환경 전체 렌더링 (하늘, 원경 스카이라인, 도로, 인도, 연석, 입체 건물, 가로수, 소품)
 */
export const drawCampusEnvironment = (
  ctx: CanvasRenderingContext2D,
  playerWorldY: number
): void => {
  // 1. Layer 0 & 1: 패럴랙스 하늘 및 원경 캠퍼스 스카이라인
  drawParallaxSky(ctx, playerWorldY);

  // 2. Layer 2: 8개 구간 테마별 3/4 쿼터뷰 도로, 인도, 연석, 바닥 마킹
  drawZoneRoad(ctx, playerWorldY);

  // 3. Layer 3: 도로 양옆 3/4 쿼터뷰 입체 건물, 가로수, 소품, 310관 게이트
  drawCampusBuildings(ctx, playerWorldY);
};

interface RenderableItem {
  depth: number;
  render: () => void;
}

/**
 * 3/4 쿼터뷰 인게임 오브젝트(장애물, 아이템, 랜드마크, 피니시 라인) 및 플레이어 깊이 정렬 렌더링
 */
export const drawStageObjects = (
  ctx: CanvasRenderingContext2D,
  objects: StageObject[],
  playerOrWorldY: Player | number,
  playerScreenYOrAssets?: number | GameAssets | null,
  maybeAssets?: GameAssets | null
): void => {
  // 인자 정규화 (하위 호환성 유지)
  let playerWorldY = 0;
  let assets: GameAssets | null | undefined = null;
  let playerObj: Player | null = null;

  if (typeof playerOrWorldY === 'object' && playerOrWorldY !== null) {
    playerObj = playerOrWorldY;
    playerWorldY = playerObj.worldY;
    assets = playerScreenYOrAssets as GameAssets | null;
  } else {
    playerWorldY = playerOrWorldY;
    assets = maybeAssets;
  }

  const renderQueue: RenderableItem[] = [];

  // 1. 스테이지 오브젝트들을 투영하여 렌더 큐에 등록
  for (const obj of objects) {
    if (obj.collected) continue;

    const relMeters = obj.worldY - playerWorldY;

    // 화면 시야 밖 오브젝트 컬링
    if (relMeters < -6 || relMeters > 55) continue;

    // 논리 좌표 중심 X
    const logicalCenterX = obj.x + obj.width / 2;
    const proj = project(logicalCenterX, relMeters);

    // 화면 세로 범위 벗어나면 스킵
    if (proj.sy < 130 || proj.sy > CANVAS_HEIGHT + 70) continue;

    const scale = proj.scale;
    const drawW = obj.width * scale;
    const drawH = obj.height * scale;
    const drawX = proj.sx - drawW / 2;
    const drawY = proj.sy - drawH; // 발밑 기준 위쪽으로 배치

    renderQueue.push({
      depth: proj.depth,
      render: () => {
        ctx.save();

        // 3/4 쿼터뷰 타원 그림자 (오른쪽 아래로 투영)
        ctx.fillStyle = SHADOW_CONFIG.color;
        ctx.beginPath();
        ctx.ellipse(
          proj.sx + SHADOW_CONFIG.offsetX * scale,
          proj.sy + SHADOW_CONFIG.offsetY * scale,
          (drawW / 2) * 1.1,
          Math.max(3, 6.5 * scale),
          0.18,
          0,
          Math.PI * 2
        );
        ctx.fill();

        if (obj.type === 'LANDMARK') {
          // 캠퍼스 입체 랜드마크 팻말
          draw3DLandmarkSign(ctx, drawX, drawY, drawW, drawH, scale, obj.name);
        } else if (obj.type === 'FINISH_LINE') {
          // 310관 도착 골인 피니시 라인 (3/4 쿼터뷰 투영 라인)
          draw3DFinishLine(ctx, proj.roadLeft, proj.roadRight, proj.sy, scale, obj.name);
        } else if (obj.type === 'ITEM') {
          // 수집 아이템 (츄르)
          const churuImg = assets?.stageAssets.itemChuru;
          if (churuImg && churuImg.complete) {
            ctx.drawImage(churuImg, drawX - 3 * scale, drawY - 3 * scale, drawW + 6 * scale, drawH + 6 * scale);
          } else {
            // Fallback 픽셀 츄르
            ctx.fillStyle = '#ec4899';
            ctx.beginPath();
            ctx.roundRect(drawX, drawY, drawW, drawH, 4 * scale);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${Math.round(9 * scale)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText('츄르', proj.sx, drawY + drawH * 0.7);
          }
        } else if (obj.type === 'OBSTACLE') {
          // 캠퍼스 장애물 에셋 렌더링
          let sprite: HTMLImageElement | null | undefined = null;
          if (obj.subType === 'COFFEE') {
            sprite = assets?.stageAssets.obsCoffee;
          } else if (obj.subType === 'EXAM') {
            sprite = assets?.stageAssets.obsBooks;
          } else if (obj.name.includes('라바콘') || obj.name.includes('공사')) {
            sprite = assets?.stageAssets.obsCone;
          } else if (obj.subType === 'KICKBOARD') {
            sprite = assets?.stageAssets.obsCone;
          }

          if (sprite && sprite.complete) {
            ctx.drawImage(sprite, drawX, drawY, drawW, drawH);
          } else {
            // Fallback 쿼터뷰 입체 블록
            ctx.fillStyle = obj.color || '#ef4444';
            ctx.beginPath();
            ctx.roundRect(drawX, drawY, drawW, drawH, 6 * scale);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${Math.round(10 * scale)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText(obj.name.slice(0, 4), proj.sx, drawY + drawH * 0.6);
          }
        }

        ctx.restore();
      },
    });
  }

  // 2. 플레이어가 객체로 전달된 경우 플레이어도 렌더 큐에 깊이 정렬 등록
  if (playerObj) {
    const catFrames = assets?.catRunFrames;
    const catHurtImg = assets?.catHurt;
    const p = playerObj;

    // 플레이어의 깊이는 발밑 Y (screenY + height)
    renderQueue.push({
      depth: p.screenY + p.height,
      render: () => {
        drawPlayer(ctx, p, catFrames, catHurtImg);
      },
    });
  }

  // 3. 깊이 정렬: depth(화면 Y)가 작은 것(먼 것)부터 큰 것(가까운 것) 순으로 렌더링!
  renderQueue.sort((a, b) => a.depth - b.depth);

  for (const item of renderQueue) {
    item.render();
  }
};

/**
 * 3/4 쿼터뷰 입체 랜드마크 안내 팻말 (앞면 + 오른쪽 옆면 + 지붕)
 */
const draw3DLandmarkSign = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  scale: number,
  name: string
): void => {
  const sideW = 8 * scale;
  const roofH = 5 * scale;

  // 기둥
  ctx.fillStyle = '#334155';
  ctx.fillRect(x + w / 2 - 3 * scale, y + h, 6 * scale, 24 * scale);

  // 팻말 앞면
  ctx.fillStyle = '#0284c7';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(1, 1.5 * scale);
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 4 * scale);
  ctx.fill();
  ctx.stroke();

  // 팻말 오른쪽 옆면
  ctx.fillStyle = '#0369a1';
  ctx.beginPath();
  ctx.moveTo(x + w, y);
  ctx.lineTo(x + w + sideW, y - roofH);
  ctx.lineTo(x + w + sideW, y + h - roofH);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
  ctx.fill();

  // 팻말 윗면
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + sideW, y - roofH);
  ctx.lineTo(x + w + sideW, y - roofH);
  ctx.lineTo(x + w, y);
  ctx.closePath();
  ctx.fill();

  // 텍스트
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.max(10, Math.round(12 * scale))}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(name, x + w / 2, y + h / 2 + 4 * scale);
};

/**
 * 3/4 쿼터뷰 310관 도착 피니시 라인 투영 렌더링
 */
const draw3DFinishLine = (
  ctx: CanvasRenderingContext2D,
  roadLeft: number,
  roadRight: number,
  sy: number,
  scale: number,
  name: string
): void => {
  const lineH = Math.max(6, 14 * scale);
  const roadW = roadRight - roadLeft;

  // 체커보드 결승선 (흰색 / 하늘색 격자)
  const cols = 14;
  for (let c = 0; c < cols; c++) {
    const x0 = roadLeft + (roadW * c) / cols;
    const w = roadW / cols;
    ctx.fillStyle = (c % 2 === 0) ? '#ffffff' : '#38bdf8';
    ctx.fillRect(x0, sy - lineH, w + 0.5, lineH);
  }

  // FINISH 배너 텍스트
  ctx.fillStyle = '#0f172a';
  ctx.font = `900 ${Math.max(12, Math.round(16 * scale))}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(name, (roadLeft + roadRight) / 2, sy - lineH - 8 * scale);
};
