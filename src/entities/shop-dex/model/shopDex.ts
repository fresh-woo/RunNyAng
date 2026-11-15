import { STREET_BUILDINGS } from '../../stage/model/streetBuildings';
import { StreetBuilding } from '../../stage/model/types';

export interface ShopDexEntry extends StreetBuilding {
  id: string;
  number: string;
  name: string;
}

export const SHOP_DEX_ENTRIES: ShopDexEntry[] = STREET_BUILDINGS
  .filter((building): building is StreetBuilding & { name: string } =>
    (building.kind === 'SHOP' || building.kind === 'HOSPITAL') && Boolean(building.name))
  .map((building, index) => ({
    ...building,
    id: `${building.fromM}-${building.side}`,
    number: String(index + 1).padStart(3, '0'),
  }));

export const SHOP_DEX_STORAGE_KEY = 'runnyang_shop_dex_v1';
const validIds = new Set(SHOP_DEX_ENTRIES.map((entry) => entry.id));
const filterIds = (value: unknown): string[] => Array.isArray(value)
  ? [...new Set(value.filter((id): id is string => typeof id === 'string' && validIds.has(id)))]
  : [];

export const readShopDex = (): string[] => {
  try {
    return filterIds(JSON.parse(localStorage.getItem(SHOP_DEX_STORAGE_KEY) ?? '[]'));
  } catch {
    return [];
  }
};

export const saveShopDex = (ids: string[]): boolean => {
  try {
    localStorage.setItem(SHOP_DEX_STORAGE_KEY, JSON.stringify(filterIds([...readShopDex(), ...ids])));
    return true;
  } catch {
    return false;
  }
};

// &는 고정 문자로 제공하고, 나머지 칸의 입력을 합쳐 이름 전체를 정확히 비교한다.
export const isShopDexAnswer = (entry: ShopDexEntry, parts: string[]): boolean =>
  parts.length === entry.name.split('&').length && parts.join('&') === entry.name;

export const getShopLetterCount = (entry: ShopDexEntry): number =>
  Array.from(entry.name).filter((letter) => letter !== '&').length;
