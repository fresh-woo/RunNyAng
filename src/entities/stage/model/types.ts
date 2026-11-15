export type StageObjectType = 'OBSTACLE' | 'ITEM' | 'LANDMARK' | 'FINISH_LINE' | 'DECORATION';

// 미터는 전체 맵 기준. 캠퍼스 구간의 참고 사진 파일명은 정문 기준(옛 0~500m) 이름 그대로.
export type StageZoneTheme =
  | 'HEUKSEOK_STATION'  // 0 ~ 270m: 흑석역 앞 (0_270.png)
  | 'CAU_HOSPITAL'      // 270 ~ 540m: 중앙대 병원 앞 (270_510.png)
  | 'GATE_ENTRANCE'     // 540 ~ 640m: 정문 안 진입로 (0_100.png)
  | 'BETWEEN_BUILDINGS' // 640 ~ 700m: 건물 사이 보행로 (100_160.png)
  | 'TREE_SQUARE'       // 700 ~ 740m: 빼빼로 광장 (160_200.png)
  | 'CAMPUS_UPHILL'     // 740 ~ 840m: 캠퍼스 오르막 차도 (200_300.png)
  | 'LIBRARY_STAIRS'    // 840 ~ 880m: 도서관 옆 긴 계단 / 헐떡고개 (300_340.png)
  | 'FOREST_SLOPE'      // 880 ~ 910m: 숲길 오르막 (340_370.png)
  | 'BUILDING_SLOPE'    // 910 ~ 990m: 건물 옆 비탈길 (370_450.png)
  | 'BUILDING_310';     // 990 ~ 1040m: 310관 앞 마지막 직선 (450_500.png)

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
  subType?: 'KICKBOARD' | 'COFFEE' | 'EXAM' | 'CHURU' | 'BLUE_DRAGON' | 'BUILDING_310' | 'STUDENT' | 'BUS';
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

/**
 * 학교 밖 거리 구간의 길가 건물 한 채.
 * fromM 지점에 건물 앞면(1층 가게와 간판)이 오고, toM 까지가 그 건물이 차지하는 길이.
 * 화면에서는 fromM 쪽이 1층, toM 쪽으로 갈수록 위층으로 보인다.
 */
export interface StreetBuilding {
  fromM: number;
  toM: number;
  side: 'LEFT' | 'RIGHT';
  kind: 'SHOP' | 'FILLER' | 'HOSPITAL' | 'SUBWAY';
  /** 간판 글자 (SHOP, HOSPITAL, SUBWAY) */
  name?: string;
  /** 간판 바탕색 */
  signBg?: string;
  /** 간판 글자색 */
  signText?: string;
  /** 건물 외벽색 */
  wall: string;
}
