import { Player } from '../../player/model/types';
import { StageObject } from '../model/types';
import { project } from './projection';

export interface ScreenRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * 고양이 히트박스 = 화면에 그려지는 고양이 스프라이트 사각형 (screenY ~ screenY + height)
 */
export const getPlayerHitbox = (player: Player): ScreenRect => ({
  x: player.x,
  y: player.screenY,
  w: player.width,
  h: player.height,
});

/**
 * 오브젝트 히트박스 = drawStageObjects 가 그리는 것과 같은 투영 사각형 (발밑 sy 기준 위로 h)
 */
export const getObjectHitbox = (obj: StageObject, playerWorldY: number): ScreenRect => {
  const proj = project(obj.x + obj.width / 2, obj.worldY - playerWorldY);
  const w = obj.width * proj.scale;
  const h = obj.height * proj.scale;
  return { x: proj.sx - w / 2, y: proj.sy - h, w, h };
};

export const rectsOverlap = (a: ScreenRect, b: ScreenRect): boolean =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

/** 개발용: URL 에 ?hitbox 를 붙이면 히트박스를 화면에 표시 */
export const SHOW_HITBOX =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('hitbox');
