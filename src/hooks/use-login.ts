import { useState } from 'react';
import { useDispatch } from 'react-redux';

import httpService from 'src/services/httpService';
import { loginStart, loginSuccess, loginFailure } from 'src/store/userSlice';
import { SUPER_ADMIN_EMAIL } from 'src/constants/auth';

import type { LoginResponse, User } from 'src/models/loginResponse';

interface LoginData {
  email: string;
  password: string;
  hardwareId: string;
  deviceType: string;
}

// Admin login response structure
interface AdminLoginResponse {
  statusCode: number;
  message: string;
  data: {
    token: string;
    user?: User;
    userId?: string;
    email?: string;
    role?: string;
    name?: string;
    permissions?: string[];
  };
}

export const useLogin = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (data: LoginData): Promise<LoginResponse> => {
    dispatch(loginStart());
    setLoading(true);
    setError(null);

    const email = data.email.toLowerCase().trim();
    const isSuperAdmin = email === SUPER_ADMIN_EMAIL;

    try {
      let token: string;
      let user: User;

      if (isSuperAdmin) {
        // Super admin login via /auth/login
        const loginPayload = {
          ...data,
          hardwareId: 'sbmm-dashboard-123',
          deviceType: 'MACOS',
        };

        const response = await httpService.post<LoginResponse>('/auth/login', loginPayload);
        token = response.data.data.token;
        user = response.data.data.user;
      } else {
        // Sub-admin login via /admin-permissions/login
        const adminResponse = await httpService.post<AdminLoginResponse>(
          '/admin-permissions/login',
          {
            email: data.email,
            password: data.password,
          }
        );

        const responseData = adminResponse.data.data;
        token = responseData.token;

        // Build user object from response
        user = responseData.user || {
          userId: responseData.userId || '',
          email: responseData.email || data.email,
          role: responseData.role || 'admin',
          name: responseData.name || data.email.split('@')[0],
          userAvatar: '',
          permissions: responseData.permissions || [],
        };
      }

      localStorage.setItem('token', token);
      dispatch(loginSuccess({ token, user }));

      return {
        statusCode: 200,
        message: 'Login successful',
        data: { token, user },
      };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Invalid credentials';
      setError(errorMessage);
      dispatch(loginFailure(errorMessage));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};
