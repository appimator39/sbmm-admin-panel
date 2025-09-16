export const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://portal.sbmm.com.pk'
    : 'https://portal.sbmm.com.pk';

export const LOGIN_URL = `${BASE_URL}/auth/login`;
