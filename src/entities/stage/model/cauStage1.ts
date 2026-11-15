import { ROAD_LEFT, ROAD_RIGHT, STAGE_LENGTH, CAMPUS_GATE_M } from '../../../shared/config/gameConfig';
import { StageData, StageObject, CampusZone } from './types';

// 중앙대학교 서울캠퍼스 Stage 1: 흑석역 -> 중앙대 병원 앞 -> 정문 -> 310관 (총 1040m)
// 학교 밖 거리 2개 구간 + 캠퍼스 8개 구간. 캠퍼스 구간은 정문(540m)부터 시작
// (참고 사진 파일명 0_100.png 등은 정문 기준 옛 미터 그대로)
export const cauCampusZones: CampusZone[] = [
  {
    fromM: 0,
    toM: 270,
    theme: 'HEUKSEOK_STATION',
    label: '흑석역 앞',
    refImage: '0_270.png',
  },
  {
    fromM: 270,
    toM: CAMPUS_GATE_M,
    theme: 'CAU_HOSPITAL',
    label: '중앙대 병원 앞',
    refImage: '270_510.png',
  },
  {
    fromM: CAMPUS_GATE_M,
    toM: 640,
    theme: 'GATE_ENTRANCE',
    label: '정문 안 진입로',
    refImage: '0_100.png',
  },
  {
    fromM: 640,
    toM: 700,
    theme: 'BETWEEN_BUILDINGS',
    label: '건물 사이 보행로',
    refImage: '100_160.png',
  },
  {
    fromM: 700,
    toM: 740,
    theme: 'TREE_SQUARE',
    label: '빼빼로 광장',
    refImage: '160_200.png',
  },
  {
    fromM: 740,
    toM: 840,
    theme: 'CAMPUS_UPHILL',
    label: '캠퍼스 오르막 차도',
    refImage: '200_300.png',
  },
  {
    fromM: 840,
    toM: 880,
    theme: 'LIBRARY_STAIRS',
    label: '도서관 옆 긴 계단',
    refImage: '300_340.png',
  },
  {
    fromM: 880,
    toM: 910,
    theme: 'FOREST_SLOPE',
    label: '숲길 오르막',
    refImage: '340_370.png',
  },
  {
    fromM: 910,
    toM: 990,
    theme: 'BUILDING_SLOPE',
    label: '도서관 옆 비탈길',
    refImage: '370_450.png',
  },
  {
    fromM: 990,
    toM: 1040,
    theme: 'BUILDING_310',
    label: '310관 앞',
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
  title: '흑석역 ➔ 310관 (100주년 기념관)',
  totalLength: STAGE_LENGTH,
  startName: '흑석역 (출발)',
  finishName: '310관 (도착)',
  zones: cauCampusZones,
  objects: [
    // ----------------------------------------------------
    // [구간 1: 0m ~ 270m] 흑석역 앞 (0_270.png)
    // 행인은 횡단보도(drawZoneRoad.ts 의 CITY_CROSSWALKS) 위에만 둔다
    // ----------------------------------------------------
    { id: 'lm_heukseok', name: '🚇 흑석역', worldY: 6, x: ROAD_LEFT - 30, width: 85, height: 45, type: 'LANDMARK' },
    { id: 'item_s1_1', name: '츄르', worldY: 20, x: 430, width: 24, height: 24, type: 'ITEM', subType: 'CHURU' },
    { id: 'obs_s1_1', name: '방치된 공유 킥보드', worldY: 35, x: 520, width: 36, height: 48, type: 'OBSTACLE', subType: 'KICKBOARD', color: '#10b981' },
    { id: 'item_s1_2', name: '츄르', worldY: 60, x: 330, width: 24, height: 24, type: 'ITEM', subType: 'CHURU' },
    { id: 'obs_s1_2', name: '횡단보도 건너는 행인', worldY: 140, x: 400, width: 26, height: 72, type: 'OBSTACLE', subType: 'STUDENT', color: '#64748b' },
    { id: 'item_s1_3', name: '츄르', worldY: 110, x: 560, width: 24, height: 24, type: 'ITEM', subType: 'CHURU' },
    { id: 'obs_s1_3', name: '쏟아진 테이크아웃 커피', worldY: 125, x: 350, width: 32, height: 32, type: 'OBSTACLE', subType: 'COFFEE', color: '#78350f' },
    { id: 'item_s1_4', name: '츄르 세트', worldY: 160, x: 450, width: 28, height: 28, type: 'ITEM', subType: 'CHURU' },
    { id: 'obs_s1_4', name: '도로 공사 라바콘', worldY: 180, x: 540, width: 32, height: 40, type: 'OBSTACLE', color: '#f97316' },
    { id: 'item_s1_5', name: '츄르', worldY: 205, x: 380, width: 24, height: 24, type: 'ITEM', subType: 'CHURU' },
    { id: 'obs_s1_5', name: '횡단보도 건너는 행인', worldY: 268, x: 470, width: 26, height: 72, type: 'OBSTACLE', subType: 'STUDENT', color: '#64748b' },
    { id: 'item_s1_6', name: '츄르', worldY: 255, x: 540, width: 24, height: 24, type: 'ITEM', subType: 'CHURU' },

    // ----------------------------------------------------
    // [구간 2: 270m ~ 540m] 중앙대 병원 앞 (270_510.png)
    // ----------------------------------------------------
    { id: 'lm_hospital', name: '🏥 중앙대학교병원', worldY: 276, x: ROAD_RIGHT - 20, width: 110, height: 45, type: 'LANDMARK' },
    { id: 'obs_s2_1', name: '병원 앞 공사 라바콘', worldY: 290, x: 420, width: 32, height: 40, type: 'OBSTACLE', color: '#f97316' },
    { id: 'item_s2_1', name: '츄르', worldY: 305, x: 560, width: 24, height: 24, type: 'ITEM', subType: 'CHURU' },
    { id: 'obs_s2_2', name: '진료 받으러 가는 행인', worldY: 283, x: 560, width: 26, height: 72, type: 'OBSTACLE', subType: 'STUDENT', color: '#64748b' },
    { id: 'item_s2_2', name: '츄르', worldY: 350, x: 380, width: 24, height: 24, type: 'ITEM', subType: 'CHURU' },
    { id: 'obs_s2_3', name: '쏟아진 커피', worldY: 395, x: 450, width: 32, height: 32, type: 'OBSTACLE', subType: 'COFFEE', color: '#78350f' },
    { id: 'item_s2_3', name: '츄르 세트', worldY: 420, x: 520, width: 28, height: 28, type: 'ITEM', subType: 'CHURU' },
    { id: 'obs_s2_4', name: '방치된 공유 킥보드', worldY: 480, x: 360, width: 36, height: 48, type: 'OBSTACLE', subType: 'KICKBOARD', color: '#10b981' },
    { id: 'item_s2_4', name: '츄르', worldY: 465, x: 440, width: 24, height: 24, type: 'ITEM', subType: 'CHURU' },
    { id: 'obs_s2_5', name: '횡단보도 건너는 학생', worldY: 442, x: 520, width: 26, height: 72, type: 'OBSTACLE', subType: 'STUDENT', color: '#64748b' },
    { id: 'item_s2_5', name: '츄르', worldY: 520, x: 400, width: 24, height: 24, type: 'ITEM', subType: 'CHURU' },
    // [540m Landmark] 중앙대 정문
    { id: 'lm_gate', name: '🎓 중앙대 정문', worldY: 544, x: ROAD_RIGHT - 20, width: 95, height: 45, type: 'LANDMARK' },

    // ----------------------------------------------------
    // [구간 3: 540m ~ 640m] 정문 안 진입로 (0_100.png)
    // ----------------------------------------------------
    { id: 'item_1_1', name: '츄르', worldY: 565, x: 420, width: 24, height: 24, type: 'ITEM', subType: 'CHURU' },
    { id: 'obs_1_1', name: '방치된 전동 킥보드', worldY: 585, x: 340, width: 36, height: 48, type: 'OBSTACLE', subType: 'KICKBOARD', color: '#10b981' },
    // [600m Landmark] 104관 (붉은 벽돌 고층 건물)
    { id: 'lm_0', name: '🏢 104관', worldY: 600, x: ROAD_RIGHT + 10, width: 85, height: 50, type: 'LANDMARK' },
    { id: 'item_1_2', name: '츄르', worldY: 610, x: 580, width: 24, height: 24, type: 'ITEM', subType: 'CHURU' },
    { id: 'obs_1_2', name: '쏟아진 커피', worldY: 625, x: 460, width: 32, height: 32, type: 'OBSTACLE', subType: 'COFFEE', color: '#78350f' },

    // [640m Landmark] 영신관 (101관)
    { id: 'lm_1', name: '🏛️ 영신관 (101관)', worldY: 640, x: ROAD_LEFT - 40, width: 90, height: 60, type: 'LANDMARK' },

    // ----------------------------------------------------
    // [구간 4: 640m ~ 700m] 건물 사이 보행로 (100_160.png)
    // ----------------------------------------------------
    { id: 'item_2_1', name: '츄르', worldY: 660, x: 360, width: 24, height: 24, type: 'ITEM', subType: 'CHURU' },
    { id: 'obs_2_1', name: '방치된 킥보드', worldY: 680, x: 550, width: 36, height: 48, type: 'OBSTACLE', subType: 'KICKBOARD', color: '#10b981' },

    // ----------------------------------------------------
    // [구간 5: 700m ~ 740m] 빼빼로 광장 (160_200.png)
    // ----------------------------------------------------
    { id: 'item_2_2', name: '츄르', worldY: 705, x: 480, width: 24, height: 24, type: 'ITEM', subType: 'CHURU' },
    // [720m Landmark] 빼빼로 광장 (중앙 광장)
    { id: 'lm_2', name: '🌳 빼빼로 광장', worldY: 720, x: ROAD_LEFT - 30, width: 85, height: 45, type: 'LANDMARK' },

    // ----------------------------------------------------
    // [구간 6: 740m ~ 840m] 캠퍼스 오르막 차도 (200_300.png)
    // ----------------------------------------------------
    { id: 'item_3_1', name: '츄르 세트', worldY: 755, x: 450, width: 28, height: 28, type: 'ITEM', subType: 'CHURU' },
    // [780m Landmark] 캠퍼스 오르막 (공사 구간)
    { id: 'lm_3', name: '🚧 캠퍼스 오르막', worldY: 780, x: ROAD_RIGHT - 10, width: 95, height: 45, type: 'LANDMARK' },
    { id: 'obs_3_1', name: '공사 안전 라바콘', worldY: 800, x: 350, width: 32, height: 40, type: 'OBSTACLE', color: '#f97316' },
    { id: 'item_3_2', name: '츄르', worldY: 820, x: 520, width: 24, height: 24, type: 'ITEM', subType: 'CHURU' },

    // ----------------------------------------------------
    // [구간 7: 840m ~ 880m] 도서관 옆 긴 계단 / 헐떡고개 (300_340.png)
    // ----------------------------------------------------
    // [840m Landmark] 헐떡고개 긴 계단
    { id: 'lm_stair', name: '⛰️ 헐떡고개 계단!', worldY: 840, x: ROAD_LEFT - 20, width: 95, height: 45, type: 'LANDMARK' },
    { id: 'obs_3_2', name: '굴러떨어지는 전공 서적', worldY: 855, x: 460, width: 40, height: 36, type: 'OBSTACLE', subType: 'EXAM', color: '#b91c1c' },
    { id: 'item_3_3', name: '츄르', worldY: 870, x: 360, width: 24, height: 24, type: 'ITEM', subType: 'CHURU' },

    // ----------------------------------------------------
    // [구간 8: 880m ~ 910m] 숲길 오르막 (340_370.png)
    // ----------------------------------------------------
    { id: 'obs_3_3', name: '바람에 날리는 과제물', worldY: 890, x: 560, width: 40, height: 32, type: 'OBSTACLE', subType: 'EXAM', color: '#e2e8f0' },
    { id: 'item_3_4', name: '츄르 세트', worldY: 905, x: 480, width: 28, height: 28, type: 'ITEM', subType: 'CHURU' },

    // ----------------------------------------------------
    // [구간 9: 910m ~ 990m] 건물 옆 비탈길 (370_450.png)
    // ----------------------------------------------------
    // [915m Landmark] 비탈길 (빼빼로 광장 방면)
    { id: 'lm_4', name: '🍫 빼빼로 광장길', worldY: 915, x: ROAD_RIGHT - 15, width: 85, height: 50, type: 'LANDMARK' },
    { id: 'obs_4_1', name: '방치된 전동 킥보드', worldY: 935, x: 380, width: 36, height: 48, type: 'OBSTACLE', subType: 'KICKBOARD', color: '#10b981' },
    { id: 'obs_4_2', name: '바람에 날리는 시험지 뭉치', worldY: 955, x: 440, width: 44, height: 32, type: 'OBSTACLE', subType: 'EXAM', color: '#e2e8f0' },
    { id: 'item_4_1', name: '츄르', worldY: 975, x: 570, width: 24, height: 24, type: 'ITEM', subType: 'CHURU' },

    // ----------------------------------------------------
    // [구간 10: 990m ~ 1040m] 310관 앞 마지막 직선 (450_500.png)
    // ----------------------------------------------------
    { id: 'obs_4_3', name: '공사 안전펜스', worldY: 995, x: 510, width: 48, height: 36, type: 'OBSTACLE', color: '#f97316' },
    { id: 'item_4_2', name: '츄르 세트', worldY: 1010, x: 450, width: 28, height: 28, type: 'ITEM', subType: 'CHURU' },
    { id: 'obs_4_4', name: '쏟아진 커피', worldY: 1025, x: 470, width: 32, height: 32, type: 'OBSTACLE', subType: 'COFFEE', color: '#78350f' },

    // [1040m Finish Line] 도착지점 310관 (100주년 기념관)
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

