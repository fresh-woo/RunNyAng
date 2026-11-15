import { ROAD_LEFT, ROAD_RIGHT, STAGE_LENGTH } from '../../../shared/config/gameConfig';
import { CampusZone, StageObject } from './types';

// 장애물 랜덤 배치 튜닝 값
export const OBSTACLE_RANDOM = {
  /** 장애물끼리 앞뒤로 최소 이만큼(m) 떨어뜨림 → 피할 틈이 항상 생김 */
  minGapM: 8,
  /** 구간 경계에서 안쪽으로 비워 둘 거리(m) */
  zoneMarginM: 2,
  /** 출발 직후에는 장애물을 두지 않음 (m) */
  startSafeM: 25,
  /** 결승선 바로 앞에는 장애물을 두지 않음 (m) */
  finishSafeM: 8,
  /** 도로 양 끝에서 안쪽으로 비워 둘 폭(px) */
  edgePaddingPx: 40,
  /** 츄르와 앞뒤 이만큼(m) 이내 + 가로로 겹치면 다른 자리를 찾음 (츄르를 가리지 않게) */
  itemClearM: 3,
  itemClearPx: 40,
  /** 자리 찾기 시도 횟수 */
  tries: 80,
};

const rand = (min: number, max: number) => min + Math.random() * (max - min);

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const randomX = (width: number) =>
  Math.round(rand(ROAD_LEFT + OBSTACLE_RANDOM.edgePaddingPx, ROAD_RIGHT - OBSTACLE_RANDOM.edgePaddingPx - width));

/**
 * 장애물(OBSTACLE)만 위치를 랜덤으로 다시 정한다. 츄르·랜드마크·결승선은 그대로.
 * - 구간(zone)별 장애물 개수와 종류는 원래 목록 그대로 → 총 개수 고정
 * - 행인(STUDENT)은 그 구간의 횡단보도 위에만 둔다
 * - 장애물끼리 minGapM 이상 앞뒤로 떨어뜨려서 못 지나가는 배치가 안 나오게 한다
 * - 자리를 못 찾으면 원래 위치를 쓴다 (개수는 절대 줄지 않음)
 */
export const randomizeObstacles = (
  objects: StageObject[],
  zones: CampusZone[],
  crosswalks: Array<[number, number]>
): StageObject[] => {
  const cfg = OBSTACLE_RANDOM;
  const obstacles = objects.filter((o) => o.type === 'OBSTACLE');
  const items = objects.filter((o) => o.type === 'ITEM');
  const placed: StageObject[] = [];

  const zoneOf = (worldY: number) =>
    zones.find((z) => worldY >= z.fromM && worldY < z.toM) ?? zones[zones.length - 1];

  const fits = (obj: StageObject, worldY: number, x: number) => {
    for (const p of placed) {
      if (Math.abs(p.worldY - worldY) < cfg.minGapM) return false;
    }
    for (const it of items) {
      if (Math.abs(it.worldY - worldY) >= cfg.itemClearM) continue;
      const overlapX =
        x < it.x + it.width + cfg.itemClearPx && x + obj.width + cfg.itemClearPx > it.x;
      if (overlapX) return false;
    }
    return true;
  };

  const place = (obj: StageObject, worldY: number, x: number) => {
    obj.worldY = Math.round(worldY * 10) / 10;
    obj.x = x;
    placed.push(obj);
  };

  // 1. 행인 먼저: 원래 구간 안의 횡단보도 중 비어 있는 곳을 랜덤으로 고름
  const usedCrosswalks = new Set<number>();
  for (const obj of obstacles.filter((o) => o.subType === 'STUDENT')) {
    const zone = zoneOf(obj.worldY);
    const candidates = shuffle(
      crosswalks
        .map((cw, i) => ({ cw, i }))
        .filter(({ cw, i }) => {
          const mid = (cw[0] + cw[1]) / 2;
          return !usedCrosswalks.has(i) && mid >= zone.fromM && mid < zone.toM && mid >= cfg.startSafeM;
        })
    );
    let done = false;
    for (const { cw, i } of candidates) {
      for (let t = 0; t < 10 && !done; t++) {
        // 구간 경계에 걸친 횡단보도(266~271m 등)는 원래 구간 쪽 부분만 씀
        const y = rand(Math.max(cw[0] + 1, zone.fromM), Math.min(cw[1] - 1, zone.toM - 0.5));
        const x = randomX(obj.width);
        if (fits(obj, y, x)) {
          usedCrosswalks.add(i);
          place(obj, y, x);
          done = true;
        }
      }
      if (done) break;
    }
    if (!done) placed.push(obj); // 원래 위치 유지
  }

  // 2. 나머지 장애물: 원래 구간 안에서 랜덤 위치
  for (const obj of obstacles.filter((o) => o.subType !== 'STUDENT')) {
    const zone = zoneOf(obj.worldY);
    const minY = Math.max(zone.fromM + cfg.zoneMarginM, cfg.startSafeM);
    const maxY = Math.min(zone.toM - cfg.zoneMarginM, STAGE_LENGTH - cfg.finishSafeM);
    let done = false;
    for (let t = 0; t < cfg.tries && !done && maxY > minY; t++) {
      const y = rand(minY, maxY);
      const x = randomX(obj.width);
      if (fits(obj, y, x)) {
        place(obj, y, x);
        done = true;
      }
    }
    if (!done) placed.push(obj); // 원래 위치 유지
  }

  return objects;
};
