import { API_BASE_URL } from '../../../shared/config/apiConfig';
import { RankingEntry, SubmitScoreRequest, SubmitScoreResponse } from '../model/types';

const NICKNAME_STORAGE_KEY = 'runnyang_nickname';

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    });
  } catch {
    throw new Error('랭킹 서버에 연결할 수 없어요.');
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error((body && typeof body.error === 'string' && body.error) || `요청 실패 (${res.status})`);
  }
  return body as T;
};

export const fetchRankings = async (limit = 50): Promise<RankingEntry[]> => {
  const data = await request<{ rankings: RankingEntry[] }>(`/api/rankings?limit=${limit}`);
  return data.rankings;
};

export const submitScore = (payload: SubmitScoreRequest): Promise<SubmitScoreResponse> =>
  request<SubmitScoreResponse>('/api/rankings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const getSavedNickname = (): string => {
  try {
    return localStorage.getItem(NICKNAME_STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
};

export const saveNickname = (nickname: string) => {
  try {
    localStorage.setItem(NICKNAME_STORAGE_KEY, nickname);
  } catch {
    /* ignore */
  }
};

export const formatRecordTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = (seconds % 60).toFixed(1).padStart(4, '0');
  return `${String(m).padStart(2, '0')}:${s}`;
};
