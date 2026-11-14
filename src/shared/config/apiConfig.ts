// 랭킹 API 서버 주소. .env 의 VITE_API_BASE_URL 로 덮어쓸 수 있다.
const DEFAULT_API_BASE_URL = 'https://api.runnyang.sublumen.xyz';

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, '');
