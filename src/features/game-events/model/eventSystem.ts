import { ROAD_LEFT, ROAD_RIGHT } from '../../../shared/config/gameConfig';
import { StageObject } from '../../../entities/stage';
import { Player } from '../../../entities/player';
import {
  GAME_EVENTS,
  GameEventDef,
  EVENT_TUNING,
  STUDENT_SIZE,
  CONE_SIZE,
  ETA_CROWD,
  INTERVIEWER,
  CONSTRUCTION,
  ACT_FILMING,
} from './eventConfig';

/** 이벤트로 생성된 장애물 (런타임 이동/정리를 위한 메타 포함) */
export interface EventObstacle extends StageObject {
  eventSpawned: true;
  /** 인터뷰어처럼 캐릭터를 쫓아오는 장애물 */
  chaser?: boolean;
}

export interface EventSystemState {
  rollTimerMs: number;
  /** 다음 이벤트까지 남은 최소 대기 시간 */
  cooldownMs: number;
  /** 에타 이벤트 진행 상태 */
  crowdRemainingMs: number;
  crowdSpawnTimerMs: number;
  /** 화면에 표시 중인 문구 */
  bannerMessage: string | null;
  bannerRemainingMs: number;
  nextId: number;
}

export const createEventSystemState = (): EventSystemState => ({
  rollTimerMs: 0,
  cooldownMs: EVENT_TUNING.minGapMs,
  crowdRemainingMs: 0,
  crowdSpawnTimerMs: 0,
  bannerMessage: null,
  bannerRemainingMs: 0,
  nextId: 0,
});

const PLAY_MIN_X = ROAD_LEFT + 10;
const PLAY_MAX_X = ROAD_RIGHT - 10;

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const clampX = (x: number, width: number) =>
  Math.max(PLAY_MIN_X, Math.min(PLAY_MAX_X - width, x));

const pickWeighted = (defs: GameEventDef[]): GameEventDef => {
  const total = defs.reduce((sum, d) => sum + d.weight, 0);
  let r = Math.random() * total;
  for (const d of defs) {
    r -= d.weight;
    if (r <= 0) return d;
  }
  return defs[defs.length - 1];
};

const makeStudent = (s: EventSystemState, x: number, worldY: number, name: string): EventObstacle => ({
  id: `evt_${s.nextId++}`,
  name,
  worldY,
  x: clampX(x, STUDENT_SIZE.width),
  width: STUDENT_SIZE.width,
  height: STUDENT_SIZE.height,
  type: 'OBSTACLE',
  subType: 'STUDENT',
  color: '#6366f1',
  eventSpawned: true,
});

const spawnAheadY = (player: Player) =>
  player.worldY + rand(EVENT_TUNING.spawnAheadMinM, EVENT_TUNING.spawnAheadMaxM);

const spawnCrowdPerson = (s: EventSystemState, player: Player, objects: StageObject[]) => {
  const x = rand(PLAY_MIN_X, PLAY_MAX_X - STUDENT_SIZE.width);
  objects.push(makeStudent(s, x, spawnAheadY(player), '몰려온 학생'));
};

const triggerEvent = (
  def: GameEventDef,
  s: EventSystemState,
  player: Player,
  objects: StageObject[]
) => {
  switch (def.id) {
    case 'ETA_CROWD':
      s.crowdRemainingMs = ETA_CROWD.durationMs;
      s.crowdSpawnTimerMs = 0;
      break;
    case 'INTERVIEWER': {
      const obj = makeStudent(s, player.x + player.width / 2 - STUDENT_SIZE.width / 2, spawnAheadY(player), '인터뷰어');
      obj.chaser = true;
      objects.push(obj);
      break;
    }
    case 'CONSTRUCTION': {
      const rowWidth =
        CONSTRUCTION.coneCount * CONE_SIZE.width + (CONSTRUCTION.coneCount - 1) * CONSTRUCTION.gapPx;
      const startX = rand(PLAY_MIN_X, PLAY_MAX_X - rowWidth);
      const worldY = spawnAheadY(player);
      for (let i = 0; i < CONSTRUCTION.coneCount; i++) {
        objects.push({
          id: `evt_${s.nextId++}`,
          name: '공사 라바콘',
          worldY,
          x: startX + i * (CONE_SIZE.width + CONSTRUCTION.gapPx),
          width: CONE_SIZE.width,
          height: CONE_SIZE.height,
          type: 'OBSTACLE',
          color: '#f97316',
          eventSpawned: true,
        } as EventObstacle);
      }
      break;
    }
    case 'ACT_FILMING': {
      const centerX = rand(
        PLAY_MIN_X + ACT_FILMING.spreadXPx / 2,
        PLAY_MAX_X - ACT_FILMING.spreadXPx / 2 - STUDENT_SIZE.width
      );
      const centerY = spawnAheadY(player);
      for (let i = 0; i < ACT_FILMING.peopleCount; i++) {
        const x = centerX + rand(-0.5, 0.5) * ACT_FILMING.spreadXPx;
        const y = centerY + rand(-0.5, 0.5) * ACT_FILMING.spreadYM;
        objects.push(makeStudent(s, x, y, 'ACT 촬영팀'));
      }
      break;
    }
  }

  s.bannerMessage = def.message;
  s.bannerRemainingMs = EVENT_TUNING.bannerDurationMs;
  s.cooldownMs =
    EVENT_TUNING.minGapMs + (def.id === 'ETA_CROWD' ? ETA_CROWD.durationMs : 0);
};

/**
 * 이벤트 시스템 1프레임 업데이트.
 * - 일정 주기로 확률 판정 후 이벤트 발생
 * - 이벤트 장애물을 objects 배열에 추가 (기존 충돌/렌더 로직을 그대로 탐)
 * - 인터뷰어 이동, 지나간 이벤트 장애물 정리
 * @returns 정리 후의 objects 배열
 */
export const updateGameEvents = (
  s: EventSystemState,
  player: Player,
  objects: StageObject[],
  deltaTimeMs: number
): StageObject[] => {
  const dtSec = deltaTimeMs / 1000;
  const inEventRange =
    player.worldY >= EVENT_TUNING.minWorldY && player.worldY <= EVENT_TUNING.maxWorldY;

  // 1. 이벤트 발생 판정
  s.cooldownMs = Math.max(0, s.cooldownMs - deltaTimeMs);
  s.rollTimerMs += deltaTimeMs;
  if (s.rollTimerMs >= EVENT_TUNING.rollIntervalMs) {
    s.rollTimerMs = 0;
    if (inEventRange && s.cooldownMs === 0 && Math.random() < EVENT_TUNING.chancePerRoll) {
      triggerEvent(pickWeighted(GAME_EVENTS), s, player, objects);
    }
  }

  // 2. 에타 이벤트: 지속 시간 동안 사람이 계속 나타남
  if (s.crowdRemainingMs > 0) {
    s.crowdRemainingMs -= deltaTimeMs;
    s.crowdSpawnTimerMs -= deltaTimeMs;
    if (s.crowdSpawnTimerMs <= 0 && player.worldY <= EVENT_TUNING.maxWorldY) {
      spawnCrowdPerson(s, player, objects);
      s.crowdSpawnTimerMs = ETA_CROWD.spawnIntervalMs;
    }
  }

  // 3. 인터뷰어 추적 이동
  for (const obj of objects) {
    const evt = obj as EventObstacle;
    if (!evt.chaser || evt.collected) continue;
    // 아직 캐릭터 앞에 있을 때만 쫓아옴 (지나치면 포기)
    if (evt.worldY < player.worldY) continue;
    const targetX = player.x + player.width / 2 - evt.width / 2;
    const maxStep = INTERVIEWER.chaseSpeedPxPerSec * dtSec;
    const diff = targetX - evt.x;
    evt.x = clampX(evt.x + Math.max(-maxStep, Math.min(maxStep, diff)), evt.width);
    evt.worldY -= INTERVIEWER.approachSpeedMps * dtSec;
  }

  // 4. 배너 타이머
  if (s.bannerRemainingMs > 0) {
    s.bannerRemainingMs -= deltaTimeMs;
    if (s.bannerRemainingMs <= 0) s.bannerMessage = null;
  }

  // 5. 지나간/맞은 이벤트 장애물 정리
  const cutoff = player.worldY - EVENT_TUNING.cleanupBehindM;
  return objects.filter(
    (o) => !(o as EventObstacle).eventSpawned || (!o.collected && o.worldY >= cutoff)
  );
};
