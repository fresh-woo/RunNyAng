export const CANVAS_WIDTH = 960;
export const CANVAS_HEIGHT = 540;

// Campus Track configuration
export const ROAD_LEFT = 220;
export const ROAD_RIGHT = 740;

// Player speeds (초당 미터: m/s 단위)
// - 그냥 걷는 속도: 3.0 m/s
// - 달리는 속도 (가속/Up): 6.0 m/s
// - 느리게 걷는 속도 (감속/Down): 1.5 m/s
export const WALK_SPEED = 4.0; // 그냥 걷는 속도 (m/s)
export const RUN_SPEED = 8.0; // 달리는 속도 (m/s)
export const SLOW_WALK_SPEED = 2.0; // 느리게 걷는 속도 (m/s)

export const BASE_FORWARD_SPEED = WALK_SPEED;
export const FORWARD_SPEED_BOOST = RUN_SPEED - WALK_SPEED;
export const LATERAL_SPEED = 6.0; // 좌우 회피 속도 (px/프레임)

// 미터 당 픽셀 수 (1m = 10px, 500m = 5,000px 트랙)
export const PIXELS_PER_METER = 60;

// 중앙대 정문에서 310관(100주년 기념관)까지의 총 거리 (500m)
export const STAGE_LENGTH = 500;

// Obstacle collision penalty configuration
export const OBSTACLE_STUN_DURATION_MS = 1000; // 충돌 시 경직/감속 지속 시간 (ms)
export const OBSTACLE_SLOW_FACTOR = 0.35; // 충돌 경직 중 전진 속도 배율 (35%)

// Player configuration (Cat Pixel Sprite)
export const PLAYER_CONFIG = {
  width: 52,
  height: 52,
  initialX: 480,
  initialY: 420,
  animationIntervalMs: 120, // 달리기 3프레임 교차 주기
  totalFrames: 3,
};


