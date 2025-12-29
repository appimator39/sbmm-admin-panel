const VITE_HOST = import.meta.env.VITE_HOST_API as string | undefined;
const IS_PROD = import.meta.env.PROD;

export const BASE_URL =
  VITE_HOST || (IS_PROD ? 'https://portal.sbmm.com.pk' : 'https://portal.sbmm.com.pk');

export const LOGIN_URL = `${BASE_URL}/auth/login`;
