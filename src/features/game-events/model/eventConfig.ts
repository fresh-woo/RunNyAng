// 랜덤 이벤트 튜닝 상수 모음 (확률/빈도/크기를 여기서만 조정하면 됨)

export type GameEventId = 'ETA_CROWD' | 'INTERVIEWER' | 'CONSTRUCTION' | 'ACT_FILMING';

export interface GameEventDef {
  id: GameEventId;
  message: string;
  /** 다른 이벤트 대비 상대 가중치 (클수록 자주 뽑힘) */
  weight: number;
}

export const GAME_EVENTS: GameEventDef[] = [
  { id: 'ETA_CROWD', message: '중냥이 사진이 에타에 올라갔다! 사람들이 몰려온다!', weight: 1 },
  { id: 'INTERVIEWER', message: '인터뷰를 하려고 하는 사람이 다가온다!', weight: 1 },
  { id: 'CONSTRUCTION', message: '공사 중인 길이다!', weight: 1 },
  { id: 'ACT_FILMING', message: 'ACT 촬영 중인 사람들이 나타났다!', weight: 1 },
];

export const EVENT_TUNING = {
  /** 이벤트 발생 여부를 굴리는 주기 (ms) */
  rollIntervalMs: 1000,
  /** 한 번 굴릴 때 이벤트가 발생할 확률 (0~1) */
  chancePerRoll: 0.2,
  /** 이벤트 종료 후 다음 이벤트까지 최소 간격 (ms) */
  minGapMs: 5000,
  /** 이 거리(m) 이전/이후에는 이벤트가 발생하지 않음 */
  minWorldY: 15,
  maxWorldY: 465,
  /** 화면 상단 이벤트 문구 표시 시간 (ms) */
  bannerDurationMs: 2500,
  /** 이벤트 장애물이 플레이어 앞 몇 m 지점에 나타나는지 */
  spawnAheadMinM: 8,
  spawnAheadMaxM: 12,
  /** 플레이어 뒤로 이만큼(m) 지나간 이벤트 장애물은 정리 */
  cleanupBehindM: 10,
};

/** 사람 장애물 크기 (obs_student.png 비율 약 0.36) */
export const STUDENT_SIZE = { width: 26, height: 72 };
/** 라바콘 장애물 크기 */
export const CONE_SIZE = { width: 34, height: 38 };

/** 에타 이벤트: 지속시간 동안 일정 간격으로 사람이 하나씩 나타남 */
export const ETA_CROWD = {
  durationMs: 3000,
  spawnIntervalMs: 300,
};

/** 인터뷰어: 캐릭터 x를 따라오며 캐릭터 쪽으로 걸어옴 */
export const INTERVIEWER = {
  /** 좌우 추적 속도 (px/초) */
  chaseSpeedPxPerSec: 90,
  /** 캐릭터 쪽으로 다가오는 속도 (m/초) */
  approachSpeedMps: 1.5,
};

/** 공사 구간: 가로로 늘어선 라바콘 */
export const CONSTRUCTION = {
  coneCount: 4,
  gapPx: 6,
};

/** ACT 촬영: 뭉쳐서 나타나는 사람 무리 */
export const ACT_FILMING = {
  peopleCount: 7,
  /** 무리의 가로 퍼짐 (px) */
  spreadXPx: 110,
  /** 무리의 세로 퍼짐 (m) */
  spreadYM: 2.5,
};
