const ENV = (import.meta as any)?.env || {};
const VITE_HOST = ENV.VITE_HOST_API as string | undefined;
const MODE = ENV.MODE as string | undefined;

export const BASE_URL =
  VITE_HOST ||
  (MODE === 'production' ? 'https://portal.sbmm.com.pk' : 'https://e414e0659c5e.ngrok-free.app');

export const LOGIN_URL = `${BASE_URL}/auth/login`;
