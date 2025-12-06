import axios from 'axios';
import { navigateToLogin } from 'src/utils/navigate';
import { BASE_URL } from 'src/utils/url';

import type { AxiosResponse, AxiosRequestConfig } from 'axios';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the JWT token in the headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle responses and errors globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || '';
    const isLoginRequest =
      requestUrl.includes('/auth/login') || requestUrl.includes('/admin-permissions/login');

    // Handle 401 - Unauthorized (redirect to login)
    if (error.response?.status === 401 && !isLoginRequest) {
      console.log('401 - redirecting to login');
      localStorage.removeItem('token');
      navigateToLogin();
    }

    // Handle 403 - Forbidden (show permission error)
    if (error.response?.status === 403) {
      const message =
        error.response?.data?.message || 'You do not have permission to perform this action.';
      // Dispatch a custom event that components can listen to
      window.dispatchEvent(
        new CustomEvent('permission-error', {
          detail: { message },
        })
      );
    }

    return Promise.reject(error);
  }
);

const httpService = {
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    axiosInstance.get<T>(url, config),

  post: <T>(url: string, data: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    axiosInstance.post<T>(url, data, config),

  put: <T>(url: string, data: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    axiosInstance.put<T>(url, data, config),

  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    axiosInstance.delete<T>(url, config),

  patch: <T>(url: string, data: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    axiosInstance.patch<T>(url, data, config),
};

export default httpService;
