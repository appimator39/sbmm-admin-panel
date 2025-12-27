import { useState } from 'react';
import { useDispatch } from 'react-redux';

import httpService from 'src/services/httpService';
import { loginStart, loginSuccess, loginFailure } from 'src/store/userSlice';

import type { LoginResponse } from 'src/models/loginResponse';

interface LoginData {
  email: string;
  password: string;
  hardwareId: string;
  deviceType: string;
}

export const useLogin = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (data: LoginData): Promise<LoginResponse> => {
    dispatch(loginStart());
    setLoading(true);
    setError(null);
    try {
      const loginPayload = {
        ...data,
        hardwareId: 'sbmm-dashboard-123', // Static random string
        deviceType: 'MACOS' // Static device type
      };
      const response = await httpService.post<LoginResponse>('/auth/login', loginPayload);
      localStorage.setItem('token', response.data.data.token);
      dispatch(loginSuccess({ token: response.data.data.token, user: response.data.data.user }));
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      dispatch(loginFailure(errorMessage));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};
