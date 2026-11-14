import { ROAD_LEFT, ROAD_RIGHT, STAGE_LENGTH } from '../../../shared/config/gameConfig';
import { StageData, StageObject, CampusZone } from './types';

// 중앙대학교 서울캠퍼스 Stage 1: 정문 -> 310관 (총 500m)
// 8개 거리별 캠퍼스 공간 테마 구간 정의
export const cauCampusZones: CampusZone[] = [
  {
    fromM: 0,
    toM: 100,
    theme: 'GATE_ENTRANCE',
    label: '정문 안 진입로',
    refImage: '0_100.png',
  },
  {
    fromM: 100,
    toM: 160,
    theme: 'BETWEEN_BUILDINGS',
    label: '건물 사이 보행로',
    refImage: '100_160.png',
  },
  {
    fromM: 160,
    toM: 200,
    theme: 'TREE_SQUARE',
    label: '나무 광장',
    refImage: '160_200.png',
  },
  {
    fromM: 200,
    toM: 300,
    theme: 'CAMPUS_UPHILL',
    label: '캠퍼스 오르막 차도',
    refImage: '200_300.png',
  },
  {
    fromM: 300,
    toM: 340,
    theme: 'LIBRARY_STAIRS',
    label: '도서관 옆 긴 계단',
    refImage: '300_340.png',
  },
  {
    fromM: 340,
    toM: 370,
    theme: 'FOREST_SLOPE',
    label: '숲길 오르막',
    refImage: '340_370.png',
  },
  {
    fromM: 370,
    toM: 450,
    theme: 'BUILDING_SLOPE',
    label: '건물 옆 비탈길',
    refImage: '370_450.png',
  },
  {
    fromM: 450,
    toM: 500,
    theme: 'BUILDING_310',
    label: '310관 앞 마지막 직선',
    refImage: '450_500.png',
  },
];

/**
 * 특정 미터 지점의 캠퍼스 구간(Zone) 정보 반환
 */
export const getZoneAt = (meters: number): CampusZone => {
  const clamped = Math.max(0, Math.min(STAGE_LENGTH, meters));
  const found = cauCampusZones.find(
    (z) => clamped >= z.fromM && (clamped < z.toM || (z.toM === STAGE_LENGTH && clamped <= z.toM))
  );
  return found || cauCampusZones[cauCampusZones.length - 1];
};

export const cauStage1Data: StageData = {
  id: 'cau_stage_1',
  title: '중앙대 정문 ➔ 310관 (100주년 기념관)',
  totalLength: STAGE_LENGTH,
  startName: '정문 (출발)',
  finishName: '310관 (도착)',
  zones: cauCampusZones,
  objects: [
    // ----------------------------------------------------
    // [구간 1: 0m ~ 100m] 정문 안 진입로 (0_100.png)
    // ----------------------------------------------------
    { id: 'item_1_1', name: '츄르', worldY: 25, x: 420, width: 24, height: 24, type: 'ITEM', subType: 'CHURU' },
    { id: 'obs_1_1', name: '방치된 전동 킥보드', worldY: 45, x: 340, width: 36, height: 48, type: 'OBSTACLE', subType: 'KICKBOARD', color: '#10b981' },
    // [60m Landmark] 104관 (붉은 벽돌 고층 건물)
    { id: 'lm_0', name: '🏢 104관', worldY: 60, x: ROAD_RIGHT + 10, width: 85, height: 50, type: 'LANDMARK' },
    { id: 'item_1_2', name: '츄르', worldY: 70, x: 580, width: 24, height: 24, type: 'ITEM', subType: 'CHURU' },
    { id: 'obs_1_2', name: '쏟아진 커피', worldY: 85, x: 460, width: 32, height: 32, type: 'OBSTACLE', subType: 'COFFEE', color: '#78350f' },

    // [100m Landmark] 영신관 (101관)
    { id: 'lm_1', name: '🏛️ 영신관 (101관)', worldY: 100, x: ROAD_LEFT - 40, width: 90, height: 60, type: 'LANDMARK' },

    // ----------------------------------------------------
    // [구간 2: 100m ~ 160m] 건물 사이 보행로 (100_160.png)
    // ----------------------------------------------------
    { id: 'item_2_1', name: '츄르', worldY: 120, x: 360, width: 24, height: 24, type: 'ITEM', subType: 'CHURU' },
    { id: 'obs_2_1', name: '방치된 킥보드', worldY: 140, x: 550, width: 36, height: 48, type: 'OBSTACLE', subType: 'KICKBOARD', color: '#10b981' },

    // ----------------------------------------------------
    // [구간 3: 160m ~ 200m] 나무 광장 (160_200.png)
    // ----------------------------------------------------
    { id: 'item_2_2', name: '츄르', worldY: 165, x: 480, width: 24, height: 24, type: 'ITEM', subType: 'CHURU' },
    // [180m Landmark] 나무 광장 (중앙 광장)
    { id: 'lm_2', name: '🌳 나무 광장', worldY: 180, x: ROAD_LEFT - 30, width: 85, height: 45, type: 'LANDMARK' },
    { id: 'obs_2_2', name: '광장 화단 경계석', worldY: 190, x: 380, width: 50, height: 32, type: 'OBSTACLE', color: '#0284c7' },

    // ----------------------------------------------------
    // [구간 4: 200m ~ 300m] 캠퍼스 오르막 차도 (200_300.png)
    // ----------------------------------------------------
    { id: 'item_3_1', name: '츄르 세트', worldY: 215, x: 450, width: 28, height: 28, type: 'ITEM', subType: 'CHURU' },
    // [240m Landmark] 캠퍼스 오르막 (공사 구간)
    { id: 'lm_3', name: '🚧 캠퍼스 오르막', worldY: 240, x: ROAD_RIGHT - 10, width: 95, height: 45, type: 'LANDMARK' },
    { id: 'obs_3_1', name: '공사 안전 라바콘', worldY: 260, x: 350, width: 32, height: 40, type: 'OBSTACLE', color: '#f97316' },
    { id: 'item_3_2', name: '츄르', worldY: 280, x: 520, width: 24, height: 24, type: 'ITEM', subType: 'CHURU' },

    // ----------------------------------------------------
    // [구간 5: 300m ~ 340m] 도서관 옆 긴 계단 / 헐떡고개 (300_340.png)
    // ----------------------------------------------------
    // [300m Landmark] 헐떡고개 긴 계단
    { id: 'lm_stair', name: '⛰️ 헐떡고개 계단!', worldY: 300, x: ROAD_LEFT - 20, width: 95, height: 45, type: 'LANDMARK' },
    { id: 'obs_3_2', name: '굴러떨어지는 전공 서적', worldY: 315, x: 460, width: 40, height: 36, type: 'OBSTACLE', subType: 'EXAM', color: '#b91c1c' },
    { id: 'item_3_3', name: '츄르', worldY: 330, x: 360, width: 24, height: 24, type: 'ITEM', subType: 'CHURU' },

    // ----------------------------------------------------
    // [구간 6: 340m ~ 370m] 숲길 오르막 (340_370.png)
    // ----------------------------------------------------
    { id: 'obs_3_3', name: '바람에 날리는 과제물', worldY: 350, x: 560, width: 40, height: 32, type: 'OBSTACLE', subType: 'EXAM', color: '#e2e8f0' },
    { id: 'item_3_4', name: '츄르 세트', worldY: 365, x: 480, width: 28, height: 28, type: 'ITEM', subType: 'CHURU' },

    // ----------------------------------------------------
    // [구간 7: 370m ~ 450m] 건물 옆 비탈길 (370_450.png)
    // ----------------------------------------------------
    // [375m Landmark] 비탈길 (빼빼로 광장 방면)
    { id: 'lm_4', name: '🍫 빼빼로 광장길', worldY: 375, x: ROAD_RIGHT - 15, width: 85, height: 50, type: 'LANDMARK' },
    { id: 'obs_4_1', name: '방치된 전동 킥보드', worldY: 395, x: 380, width: 36, height: 48, type: 'OBSTACLE', subType: 'KICKBOARD', color: '#10b981' },
    { id: 'obs_4_2', name: '바람에 날리는 시험지 뭉치', worldY: 415, x: 440, width: 44, height: 32, type: 'OBSTACLE', subType: 'EXAM', color: '#e2e8f0' },
    { id: 'item_4_1', name: '츄르', worldY: 435, x: 570, width: 24, height: 24, type: 'ITEM', subType: 'CHURU' },

    // ----------------------------------------------------
    // [구간 8: 450m ~ 500m] 310관 앞 마지막 직선 (450_500.png)
    // ----------------------------------------------------
    { id: 'obs_4_3', name: '공사 안전펜스', worldY: 455, x: 510, width: 48, height: 36, type: 'OBSTACLE', color: '#f97316' },
    { id: 'item_4_2', name: '츄르 세트', worldY: 470, x: 450, width: 28, height: 28, type: 'ITEM', subType: 'CHURU' },
    { id: 'obs_4_4', name: '쏟아진 커피', worldY: 485, x: 470, width: 32, height: 32, type: 'OBSTACLE', subType: 'COFFEE', color: '#78350f' },

    // [500m Finish Line] 도착지점 310관 (100주년 기념관)
    {
      id: 'finish',
      name: '🏁 310관 (100주년 기념관) 골인!',
      worldY: STAGE_LENGTH,
      x: ROAD_LEFT,
      width: ROAD_RIGHT - ROAD_LEFT,
      height: 24,
      type: 'FINISH_LINE',
      subType: 'BUILDING_310',
      color: '#38bdf8',
    },
  ],
};

export const getStage1Objects = (): StageObject[] => {
  return JSON.parse(JSON.stringify(cauStage1Data.objects));
};

