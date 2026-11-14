import {
  ROAD_LEFT,
  ROAD_RIGHT,
  PIXELS_PER_METER,
} from '../../../shared/config/gameConfig';

export const PLAYER_SCREEN_Y = 420;
export const ROAD_CENTER_X = (ROAD_LEFT + ROAD_RIGHT) / 2; // 480
export const ROAD_LOGICAL_WIDTH = ROAD_RIGHT - ROAD_LEFT; // 520

/**
 * 3/4 쿼터뷰(오블리크 원근) 투영 결과 인터페이스
 */
export interface ProjectedPoint {
  /** 화면 기준 X (물체 중심/발밑 X) */
  sx: number;
  /** 화면 기준 Y (물체 발밑 Y) */
  sy: number;
  /** 원근 스케일 (0.6 ~ 1.05) */
  scale: number;
  /** 깊이 정렬용 깊이값 (화면 Y 기준 정렬) */
  depth: number;
  /** 원근에 의해 투영된 도로 폭 */
  roadWidth: number;
  /** 원근에 의해 투영된 도로 좌측 X */
  roadLeft: number;
  /** 원근에 의해 투영된 도로 우측 X */
  roadRight: number;
}

/**
 * 카메라 시점: 왼쪽 위에서 오른쪽 아래를 비스듬히 내려다보는 3/4 쿼터뷰 시점
 *
 * 논리 좌표:
 * - logicalX: 도로 폭 방향 좌표 (ROAD_LEFT = 220 ~ ROAD_RIGHT = 740, 중심 480)
 * - relMeters: 플레이어와의 상대 거리 (미터, obj.worldY - playerWorldY)
 *   - relMeters = 0: 플레이어 위치 (sy = 420, scale = 1.0)
 *   - relMeters > 0: 플레이어 앞쪽 (화면 위쪽으로 전진, 멀어질수록 왼쪽 위로 기울어짐)
 *   - relMeters < 0: 플레이어 뒤쪽 (화면 아래쪽)
 */
export const project = (logicalX: number, relMeters: number): ProjectedPoint => {
  // 1. 수직 거리 변환 (원근 압축 적용)
  // 멀어질수록 단위 미터당 픽셀 간격이 자연스럽게 압축됨
  const distPx = relMeters * PIXELS_PER_METER;

  // 원근감 스케일 (멀수록 물체와 도로가 살짝 좁아짐)
  // 전방 50m(500px) 지점에서 약 0.72 스케일
  const perspectiveScale = 1 / (1 + Math.max(0, relMeters) * 0.0078);
  const scale = Math.max(0.55, Math.min(1.1, perspectiveScale));

  // 화면 Y: 플레이어 기준(420)에서 위로 올라감
  // y축 원근 감쇠를 살짝 주어 지평선 방향으로 압축감 연출
  const sy = PLAYER_SCREEN_Y - distPx * Math.pow(scale, 0.35);

  // 2. 3/4 쿼터뷰 기울기 (왼쪽 위에서 오른쪽 아래로 뻗는 도로)
  // 멀어질수록(sy가 작아질수록) 도로 중심선이 왼쪽으로 완만하게 편향됨
  const verticalDelta = PLAYER_SCREEN_Y - sy;
  // 기울기 계수: 화면 상단(sy=0, delta=420)에서 약 -70px 정도 왼쪽으로 기움
  const skewX = -0.165 * verticalDelta;

  // 투영된 도로 중심
  const currentRoadCenter = ROAD_CENTER_X + skewX;
  const currentRoadWidth = ROAD_LOGICAL_WIDTH * scale;

  // 도로 좌우 경계
  const roadLeft = currentRoadCenter - currentRoadWidth / 2;
  const roadRight = currentRoadCenter + currentRoadWidth / 2;

  // 논리 X 위치를 투영된 도로 폭과 중심에 매핑
  const xOffsetFromCenter = (logicalX - ROAD_CENTER_X) * scale;
  const sx = currentRoadCenter + xOffsetFromCenter;

  return {
    sx,
    sy,
    scale,
    depth: sy,
    roadWidth: currentRoadWidth,
    roadLeft,
    roadRight,
  };
};

/**
 * 3/4 쿼터뷰 그림자 투영 파라미터 (빛이 왼쪽 위에서 오므로 그림자는 오른쪽 아래로 드리움)
 */
export const SHADOW_CONFIG = {
  offsetX: 10,       // 오른쪽으로 드리우는 그림자 X 오프셋 (scale 비례)
  offsetY: 6,        // 아래쪽으로 드리우는 그림자 Y 오프셋 (scale 비례)
  color: 'rgba(15, 23, 42, 0.32)', // 그림자 색상
  blur: 4,
};
