export type StageObjectType = 'OBSTACLE' | 'ITEM' | 'LANDMARK' | 'FINISH_LINE';

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
  objects: StageObject[];
}
