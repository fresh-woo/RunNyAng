export interface RankingEntry {
  rank: number;
  nickname: string;
  timeSeconds: number;
  churu: number;
  createdAt: string;
}

export interface SubmitScoreRequest {
  nickname: string;
  timeSeconds: number;
  churu: number;
}

export interface SubmitScoreResponse {
  entry: RankingEntry;
  rank: number;
  /** false 면 기존 기록이 더 좋아서 갱신되지 않음 */
  improved: boolean;
}
