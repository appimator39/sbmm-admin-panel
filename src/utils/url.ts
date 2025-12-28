const ENV = (import.meta as any)?.env || {};
const VITE_HOST = ENV.VITE_HOST_API as string | undefined;
const MODE = ENV.MODE as string | undefined;

export const BASE_URL =
  VITE_HOST ||
  (MODE === 'production' ? 'https://portal.sbmm.com.pk' : 'https://portal.sbmm.com.pk');

export const LOGIN_URL = `${BASE_URL}/auth/login`;
