export const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://portal.sbmm.com.pk'
    : 'http://localhost:3030';

export const LOGIN_URL = `${BASE_URL}/auth/login`;