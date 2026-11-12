import { ROAD_LEFT, ROAD_RIGHT, STAGE_LENGTH } from '../../../shared/config/gameConfig';
import { StageData, StageObject } from './types';

// 중앙대학교 서울캠퍼스 Stage 1: 정문 -> 310관
// 약 3분(180초) 플레이 타임 기준: STAGE_LENGTH = 27,000
// 주요 랜드마크 구간:
// 1. [0m ~ 4,500m]: 정문 ~ 영신관 구간
// 2. [4,500m ~ 11,000m]: 영신관 ~ 청룡탕 & 잔디광장 구간
// 3. [11,000m ~ 19,000m]: 헐떡고개 구간
// 4. [19,000m ~ 26,000m]: 빼빼로 광장 & 310관 진입 구간
// 5. [27,000m]: 310관 (100주년 기념관) 피니시 라인
export const cauStage1Data: StageData = {
  id: 'cau_stage_1',
  title: '중앙대 정문 ➔ 310관 (100주년 기념관)',
  totalLength: STAGE_LENGTH,
  startName: '정문 (출발)',
  finishName: '310관 (도착)',
  objects: [
    // ----------------------------------------------------
    // [구간 1: 0m ~ 4,500m] 정문 출발 및 영신관 진입로
    // ----------------------------------------------------
    { id: 'item_1_1', name: '츄르', worldY: 800, x: 400, width: 24, height: 24, type: 'ITEM', subType: 'CHURU' },
    { id: 'obs_1_1', name: '방치된 전동 킥보드', worldY: 1400, x: 340, width: 36, height: 48, type: 'OBSTACLE', subType: 'KICKBOARD', color: '#10b981' },
    { id: 'item_1_2', name: '츄르', worldY: 2100, x: 580, width: 24, height: 24, type: 'ITEM', subType: 'CHURU' },
    { id: 'obs_1_2', name: '쏟아진 커피', worldY: 2800, x: 460, width: 32, height: 32, type: 'OBSTACLE', subType: 'COFFEE', color: '#78350f' },
    { id: 'item_1_3', name: '츄르', worldY: 3600, x: 360, width: 24, height: 24, type: 'ITEM', subType: 'CHURU' },
    { id: 'obs_1_3', name: '방치된 킥보드', worldY: 4200, x: 550, width: 36, height: 48, type: 'OBSTACLE', subType: 'KICKBOARD', color: '#10b981' },

    // [4,500m Landmark] 영신관 (101관)
    { id: 'lm_1', name: '🏛️ 영신관 (101관)', worldY: 4500, x: ROAD_LEFT - 40, width: 90, height: 60, type: 'LANDMARK' },

    // ----------------------------------------------------
    // [구간 2: 4,500m ~ 11,000m] 잔디광장 및 청룡연못(청룡탕)
    // ----------------------------------------------------
    { id: 'item_2_1', name: '츄르', worldY: 5300, x: 480, width: 24, height: 24, type: 'ITEM', subType: 'CHURU' },
    { id: 'obs_2_1', name: '잔디광장 물호스', worldY: 6100, x: 380, width: 50, height: 32, type: 'OBSTACLE', color: '#0284c7' },
    { id: 'item_2_2', name: '츄르', worldY: 7000, x: 320, width: 24, height: 24, type: 'ITEM', subType: 'CHURU' },
    { id: 'obs_2_2', name: '쏟아진 아이스 아메리카노', worldY: 7800, x: 530, width: 32, height: 32, type: 'OBSTACLE', subType: 'COFFEE', color: '#78350f' },
    { id: 'item_2_3', name: '츄르 세트', worldY: 8800, x: 450, width: 28, height: 28, type: 'ITEM', subType: 'CHURU' },
    { id: 'obs_2_3', name: '청룡탕 물웅덩이', worldY: 9600, x: 420, width: 60, height: 36, type: 'OBSTACLE', color: '#0284c7' },
    { id: 'item_2_4', name: '츄르', worldY: 10300, x: 600, width: 24, height: 24, type: 'ITEM', subType: 'CHURU' },

    // [10,500m Landmark] 청룡탕
    { id: 'lm_2', name: '🐉 청룡연못 (청룡탕)', worldY: 10500, x: ROAD_RIGHT - 20, width: 110, height: 80, type: 'LANDMARK', subType: 'BLUE_DRAGON' },

    // ----------------------------------------------------
    // [구간 3: 11,000m ~ 19,000m] 악명 높은 헐떡고개 업힐 구간
    // ----------------------------------------------------
    // [11,200m Landmark] 헐떡고개 시작 안내
    { id: 'lm_3', name: '⛰️ 헐떡고개 시작!', worldY: 11200, x: ROAD_LEFT - 20, width: 85, height: 45, type: 'LANDMARK' },
    { id: 'obs_3_1', name: '헐떡고개 공사 라바콘', worldY: 12200, x: 350, width: 32, height: 40, type: 'OBSTACLE', color: '#f97316' },
    { id: 'item_3_1', name: '츄르', worldY: 13100, x: 520, width: 24, height: 24, type: 'ITEM', subType: 'CHURU' },
    { id: 'obs_3_2', name: '굴러떨어지는 전공 서적', worldY: 14000, x: 460, width: 40, height: 36, type: 'OBSTACLE', subType: 'EXAM', color: '#b91c1c' },
    { id: 'item_3_2', name: '츄르', worldY: 15000, x: 360, width: 24, height: 24, type: 'ITEM', subType: 'CHURU' },
    { id: 'obs_3_3', name: '바람에 날리는 과제물', worldY: 15900, x: 560, width: 40, height: 32, type: 'OBSTACLE', subType: 'EXAM', color: '#e2e8f0' },
    { id: 'item_3_3', name: '츄르 세트', worldY: 16900, x: 480, width: 28, height: 28, type: 'ITEM', subType: 'CHURU' },
    { id: 'obs_3_4', name: '방치된 전동 킥보드', worldY: 17800, x: 380, width: 36, height: 48, type: 'OBSTACLE', subType: 'KICKBOARD', color: '#10b981' },
    { id: 'item_3_4', name: '츄르', worldY: 18600, x: 540, width: 24, height: 24, type: 'ITEM', subType: 'CHURU' },

    // ----------------------------------------------------
    // [구간 4: 19,000m ~ 26,000m] 빼빼로 광장 & 310관 입구 직선로
    // ----------------------------------------------------
    // [19,500m Landmark] 빼빼로 광장
    { id: 'lm_4', name: '🍫 빼빼로 광장', worldY: 19500, x: ROAD_RIGHT - 15, width: 85, height: 50, type: 'LANDMARK' },
    { id: 'obs_4_1', name: '바람에 날리는 시험지 뭉치', worldY: 20500, x: 430, width: 44, height: 32, type: 'OBSTACLE', subType: 'EXAM', color: '#e2e8f0' },
    { id: 'item_4_1', name: '츄르', worldY: 21500, x: 340, width: 24, height: 24, type: 'ITEM', subType: 'CHURU' },
    { id: 'obs_4_2', name: '공사 안전펜스', worldY: 22600, x: 520, width: 48, height: 36, type: 'OBSTACLE', color: '#f97316' },
    { id: 'item_4_2', name: '츄르 세트', worldY: 23600, x: 450, width: 28, height: 28, type: 'ITEM', subType: 'CHURU' },
    { id: 'obs_4_3', name: '방치된 전동 킥보드', worldY: 24700, x: 360, width: 36, height: 48, type: 'OBSTACLE', subType: 'KICKBOARD', color: '#10b981' },
    { id: 'item_4_3', name: '츄르', worldY: 25600, x: 570, width: 24, height: 24, type: 'ITEM', subType: 'CHURU' },
    { id: 'obs_4_4', name: '쏟아진 커피', worldY: 26300, x: 470, width: 32, height: 32, type: 'OBSTACLE', subType: 'COFFEE', color: '#78350f' },

    // ----------------------------------------------------
    // [구간 5: 27,000m] 도착지점 310관 (100주년 기념관)
    // ----------------------------------------------------
    {
      id: 'finish',
      name: '🏁 310관(100주년 기념관) 골인! (GOAL)',
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

