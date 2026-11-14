export type StageObjectType = 'OBSTACLE' | 'ITEM' | 'LANDMARK' | 'FINISH_LINE';

export type StageZoneTheme =
  | 'GATE_ENTRANCE'     // 0 ~ 100m: 정문 안 진입로 (0_100.png)
  | 'BETWEEN_BUILDINGS' // 100 ~ 160m: 건물 사이 보행로 (100_160.png)
  | 'TREE_SQUARE'       // 160 ~ 200m: 나무 광장 (160_200.png)
  | 'CAMPUS_UPHILL'     // 200 ~ 300m: 캠퍼스 오르막 차도 (200_300.png)
  | 'LIBRARY_STAIRS'    // 300 ~ 340m: 도서관 옆 긴 계단 / 헐떡고개 (300_340.png)
  | 'FOREST_SLOPE'      // 340 ~ 370m: 숲길 오르막 (340_370.png)
  | 'BUILDING_SLOPE'    // 370 ~ 450m: 건물 옆 비탈길 (370_450.png)
  | 'BUILDING_310';     // 450 ~ 500m: 310관 앞 마지막 직선 (450_500.png)

export interface CampusZone {
  fromM: number;
  toM: number;
  theme: StageZoneTheme;
  label: string;
  refImage: string;
}

export interface StageObject {
  id: string;
  name: string;
  worldY: number; // 거리 위치 (0 ~ STAGE_LENGTH)
  x: number;      // 도로 상의 가로 위치
  width: number;
  height: number;
  type: StageObjectType;
  color?: string;
  subType?: 'KICKBOARD' | 'COFFEE' | 'EXAM' | 'CHURU' | 'BLUE_DRAGON' | 'BUILDING_310';
  collected?: boolean;
}

export interface StageData {
  id: string;
  title: string;
  totalLength: number;
  startName: string;
  finishName: string;
  zones: CampusZone[];
  objects: StageObject[];
}
