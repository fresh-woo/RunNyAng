import { CAMPUS_GATE_M } from '../../../shared/config/gameConfig';
import { StreetBuilding } from './types';

// 학교 밖 거리 구간(0 ~ 540m) 길가 건물 배치
// - 가게 이름과 위치(m, 좌우)는 기획 목록 그대로. 로고 대신 단색 간판 + 가게 이름 글자로 표현
// - 이름 있는 가게 사이 빈 곳은 이름 없는 상가 건물(FILLER)로 채워서 길이 끊기지 않게 함
// - 한 가게 건물은 기본 10m (다음 가게가 더 가까우면 거기까지)

interface ShopSpec {
  m: number;
  side: 'LEFT' | 'RIGHT';
  name: string;
  signBg: string;
  signText: string;
  wall: string;
}

const SHOPS: ShopSpec[] = [
  // ---------------- 흑석역 앞 (0 ~ 270m) ----------------
  { m: 50, side: 'RIGHT', name: '깐부치킨', signBg: '#b91c1c', signText: '#ffffff', wall: '#d6c7b0' },
  { m: 100, side: 'LEFT', name: '노랑통닭', signBg: '#facc15', signText: '#422006', wall: '#a8a29e' },
  { m: 150, side: 'RIGHT', name: '한신포차', signBg: '#ea580c', signText: '#ffffff', wall: '#e7d8c0' },
  { m: 200, side: 'LEFT', name: '술광장', signBg: '#1e1b4b', signText: '#fde047', wall: '#9ca3af' },
  { m: 220, side: 'RIGHT', name: '컴포즈커피', signBg: '#fde047', signText: '#1c1917', wall: '#e5e7eb' },
  { m: 250, side: 'LEFT', name: '고기싸롱', signBg: '#451a03', signText: '#fef3c7', wall: '#b8a48c' },
  { m: 250, side: 'RIGHT', name: '치폴레옹', signBg: '#dc2626', signText: '#fefce8', wall: '#cbb79a' },
  { m: 260, side: 'RIGHT', name: '메가커피', signBg: '#facc15', signText: '#3f2a14', wall: '#d4d4d8' },

  // ---------------- 중앙대 병원 앞 (270 ~ 540m) ----------------
  { m: 310, side: 'RIGHT', name: '매머드커피', signBg: '#1e3a8a', signText: '#ffffff', wall: '#9a5b3c' },
  { m: 320, side: 'RIGHT', name: '맘스터치', signBg: '#e11d48', signText: '#ffffff', wall: '#8b4a32' },
  { m: 360, side: 'RIGHT', name: '백소정', signBg: '#18181b', signText: '#fafafa', wall: '#a16207' },
  { m: 375, side: 'LEFT', name: '투썸플레이스', signBg: '#7f1d1d', signText: '#ffffff', wall: '#d6d3d1' },
  { m: 380, side: 'RIGHT', name: '타래퀸', signBg: '#7e22ce', signText: '#ffffff', wall: '#9a5b3c' },
  { m: 385, side: 'LEFT', name: '청기와뼈다귀해장국', signBg: '#1d4ed8', signText: '#ffffff', wall: '#c4b5a0' },
  { m: 400, side: 'LEFT', name: '기꾸스시', signBg: '#0f172a', signText: '#f8fafc', wall: '#a8a29e' },
  { m: 415, side: 'LEFT', name: '포마토김밥', signBg: '#dc2626', signText: '#ffffff', wall: '#e7e5e4' },
  { m: 435, side: 'LEFT', name: '아스카라멘', signBg: '#111827', signText: '#f87171', wall: '#b8a48c' },
  { m: 445, side: 'RIGHT', name: '베스킨라빈스', signBg: '#db2777', signText: '#ffffff', wall: '#8b4a32' },
  { m: 465, side: 'RIGHT', name: '바나프레소', signBg: '#f472b6', signText: '#ffffff', wall: '#9a5b3c' },
  { m: 475, side: 'RIGHT', name: '포토그레이', signBg: '#52525b', signText: '#ffffff', wall: '#d4d4d8' },
  { m: 485, side: 'RIGHT', name: '더진국', signBg: '#1c1917', signText: '#fbbf24', wall: '#8b4a32' },
  { m: 495, side: 'RIGHT', name: '라이스&포테이토', signBg: '#15803d', signText: '#ffffff', wall: '#a16207' },
  { m: 530, side: 'RIGHT', name: '올리브영', signBg: '#65a30d', signText: '#ffffff', wall: '#e5e7eb' },
  { m: 540, side: 'RIGHT', name: '써브웨이', signBg: '#166534', signText: '#facc15', wall: '#d6d3d1' },
];

/** 이름 없는 상가 외벽색 (사진 속 베이지 타일, 회색, 벽돌) */
const FILLER_WALLS = ['#d6c7b0', '#9ca3af', '#a0522d', '#e7e5e4', '#b8a48c', '#8b4a32', '#cbd5e1'];

const SHOP_DEPTH_M = 10;
const FILLER_TARGET_M = 10;

/** 한쪽 길가의 [startM, endM) 범위를 가게 + 채움 건물로 빈틈없이 채운다 */
const buildSide = (
  side: 'LEFT' | 'RIGHT',
  startM: number,
  endM: number,
  special: StreetBuilding[]
): StreetBuilding[] => {
  const fixed: StreetBuilding[] = [
    ...special.filter((b) => b.side === side && b.fromM >= startM && b.fromM < endM),
    ...SHOPS.filter((s) => s.side === side && s.m >= startM && s.m < endM).map<StreetBuilding>((s) => ({
      fromM: s.m,
      toM: s.m + SHOP_DEPTH_M,
      side,
      kind: 'SHOP',
      name: s.name,
      signBg: s.signBg,
      signText: s.signText,
      wall: s.wall,
    })),
  ].sort((a, b) => a.fromM - b.fromM);

  // 다음 건물이나 범위 끝과 겹치지 않게 자르기
  for (let i = 0; i < fixed.length; i++) {
    const next = i + 1 < fixed.length ? fixed[i + 1].fromM : endM;
    fixed[i].toM = Math.min(fixed[i].toM, next);
  }

  const result: StreetBuilding[] = [];
  let cursor = startM;
  let fillerIdx = side === 'LEFT' ? 0 : 3;
  const fillGap = (a: number, b: number) => {
    const gap = b - a;
    if (gap <= 0.5) return;
    const n = Math.max(1, Math.round(gap / FILLER_TARGET_M));
    for (let k = 0; k < n; k++) {
      result.push({
        fromM: a + (gap * k) / n,
        toM: a + (gap * (k + 1)) / n,
        side,
        kind: 'FILLER',
        wall: FILLER_WALLS[fillerIdx++ % FILLER_WALLS.length],
      });
    }
  };

  for (const b of fixed) {
    if (b.fromM > cursor) fillGap(cursor, b.fromM);
    result.push(b);
    cursor = Math.max(cursor, b.toM);
  }
  fillGap(cursor, endM);
  return result;
};

// 왼쪽: 흑석역 출입구 -> 상가 -> 중앙대학교병원(엄청 큼) -> 나무 공터 -> 식당가 -> 상가
const LEFT_SPECIAL: StreetBuilding[] = [
  {
    fromM: -12,
    toM: 14,
    side: 'LEFT',
    kind: 'SUBWAY',
    name: '흑석역',
    signBg: '#a68b4b', // 9호선 금색 계열
    signText: '#ffffff',
    wall: '#e2e8f0',
  },
  {
    fromM: 270,
    toM: 345,
    side: 'LEFT',
    kind: 'HOSPITAL',
    name: '중앙대학교병원',
    signBg: '#1e40af',
    signText: '#ffffff',
    wall: '#e2e8f0',
  },
];

/** 병원 옆 나무 공터 (건물 없이 가로수만) */
export const HOSPITAL_TREE_GAP = { fromM: 345, toM: 375 };

export const STREET_BUILDINGS: StreetBuilding[] = [
  ...buildSide('LEFT', -12, HOSPITAL_TREE_GAP.fromM, LEFT_SPECIAL),
  ...buildSide('LEFT', HOSPITAL_TREE_GAP.toM, CAMPUS_GATE_M, []),
  // 오른쪽 마지막 써브웨이(540m)는 정문 바로 앞 모퉁이 가게라 8m만 차지
  ...buildSide('RIGHT', -12, CAMPUS_GATE_M + 8, []),
].sort((a, b) => a.fromM - b.fromM);

/** 건물이 이어지는 거리 구간의 끝 (이 뒤로는 캠퍼스 구간) */
export const STREET_BUILDINGS_END_M = CAMPUS_GATE_M + 8;
