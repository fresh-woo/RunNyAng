export const CANVAS_WIDTH = 960;
export const CANVAS_HEIGHT = 540;

// Campus Track configuration
export const ROAD_LEFT = 220;
export const ROAD_RIGHT = 740;

// Player speeds
// 1. 캐릭터 이동 속도 밸런스 하향 조정
// - LATERAL_SPEED: 기존 6 대비 0.75배 -> 4.5
// - BASE_FORWARD_SPEED: 기존 5 대비 0.5배 -> 2.5
export const BASE_FORWARD_SPEED = 2.5;
export const LATERAL_SPEED = 4.5;
export const FORWARD_SPEED_BOOST = 1.25;

// 3. 맵 길이 확장 (약 3분 = 180초 플레이 타임 기준)
// 계산 기준: 목표 거리 = (초당 60프레임 * 기본 전진 속도 2.5) * 180초 = 27,000
export const STAGE_LENGTH = 27000; // 정문에서 310관까지의 총 거리 (약 3분 소요)

// Obstacle collision penalty configuration
export const OBSTACLE_STUN_DURATION_MS = 1200; // 충돌 시 경직/감속 지속 시간 (ms)
export const OBSTACLE_SLOW_FACTOR = 0.35; // 충돌 경직 중 전진 속도 배율 (35%)

// Player configuration (Cute Cat Dummy)
export const PLAYER_CONFIG = {
  width: 44,
  height: 44,
  initialX: 480,
  initialY: 420,
  animationIntervalMs: 140, // 달리기 교차 주기
  totalFrames: 3,
};

