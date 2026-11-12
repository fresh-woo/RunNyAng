import { ROAD_LEFT, ROAD_RIGHT, STAGE_LENGTH } from '../../../shared/config/gameConfig';
import { StageData, StageObject } from './types';

// 중앙대학교 서울캠퍼스 Stage 1: 정문 -> 310관
export const cauStage1Data: StageData = {
  id: 'cau_stage_1',
  title: '중앙대 정문 ➔ 310관 (100주년 기념관)',
  totalLength: STAGE_LENGTH,
  startName: '정문 (출발)',
  finishName: '310관 (도착)',
  objects: [
    // [0 ~ 500m]: 정문 ~ 영신관 구간
    { id: 'item_1', name: '츄르', worldY: 200, x: 420, width: 24, height: 24, type: 'ITEM', subType: 'CHURU' },
    { id: 'obs_1', name: '방치된 전동 킥보드', worldY: 350, x: 340, width: 36, height: 48, type: 'OBSTACLE', subType: 'KICKBOARD', color: '#10b981' },
    { id: 'item_2', name: '츄르', worldY: 480, x: 550, width: 24, height: 24, type: 'ITEM', subType: 'CHURU' },

    // [500m]: 영신관 랜드마크
    { id: 'lm_1', name: '영신관 (101관)', worldY: 550, x: ROAD_LEFT - 40, width: 80, height: 60, type: 'LANDMARK' },

    // [700 ~ 1200m]: 잔디광장 & 청룡연못 구간
    { id: 'obs_2', name: '쏟아진 아이스 아메리카노', worldY: 750, x: 480, width: 32, height: 32, type: 'OBSTACLE', subType: 'COFFEE', color: '#78350f' },
    { id: 'item_3', name: '츄르', worldY: 900, x: 380, width: 24, height: 24, type: 'ITEM', subType: 'CHURU' },
    { id: 'lm_2', name: '청룡연못 (청룡탕) 🐉', worldY: 1050, x: ROAD_RIGHT - 20, width: 100, height: 80, type: 'LANDMARK', subType: 'BLUE_DRAGON' },
    { id: 'obs_3', name: '청룡탕 물웅덩이', worldY: 1120, x: 440, width: 60, height: 36, type: 'OBSTACLE', color: '#0284c7' },

    // [1300 ~ 2000m]: 공포의 헐떡고개 구간
    { id: 'lm_3', name: '헐떡고개 시작! ⛰️', worldY: 1400, x: ROAD_LEFT - 20, width: 70, height: 40, type: 'LANDMARK' },
    { id: 'obs_4', name: '굴러떨어지는 전공 서적', worldY: 1550, x: 320, width: 40, height: 36, type: 'OBSTACLE', subType: 'EXAM', color: '#b91c1c' },
    { id: 'item_4', name: '츄르', worldY: 1650, x: 600, width: 24, height: 24, type: 'ITEM', subType: 'CHURU' },
    { id: 'obs_5', name: '헐떡고개 공사 라바콘', worldY: 1800, x: 500, width: 32, height: 40, type: 'OBSTACLE', color: '#f97316' },

    // [2100 ~ 2800m]: 빼빼로 광장 & 310관 입구
    { id: 'lm_4', name: '빼빼로 광장', worldY: 2200, x: ROAD_RIGHT - 10, width: 60, height: 50, type: 'LANDMARK' },
    { id: 'obs_6', name: '바람에 날리는 시험지 뭉치', worldY: 2400, x: 430, width: 44, height: 32, type: 'OBSTACLE', subType: 'EXAM', color: '#e2e8f0' },
    { id: 'item_5', name: '츄르 세트', worldY: 2600, x: 480, width: 28, height: 28, type: 'ITEM', subType: 'CHURU' },
    { id: 'obs_7', name: '방치된 전동 킥보드', worldY: 2750, x: 580, width: 36, height: 48, type: 'OBSTACLE', subType: 'KICKBOARD', color: '#10b981' },

    // [3000m]: 도착지점 310관
    { id: 'finish', name: '🏁 310관 도착! (GOAL)', worldY: STAGE_LENGTH, x: ROAD_LEFT, width: ROAD_RIGHT - ROAD_LEFT, height: 20, type: 'FINISH_LINE', subType: 'BUILDING_310', color: '#38bdf8' },
  ],
};

export const getStage1Objects = (): StageObject[] => {
  return JSON.parse(JSON.stringify(cauStage1Data.objects));
};
