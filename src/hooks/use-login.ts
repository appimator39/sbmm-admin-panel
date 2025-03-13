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
      // Check if the user's role is admin before saving the token
      if (response.data.data.user.role === 'admin') {
        localStorage.setItem('token', response.data.data.token);
        dispatch(loginSuccess({ token: response.data.data.token, user: response.data.data.user }));
      } else {
        const errorMessage = 'Only admin users can log in.';
        setError(errorMessage);
        dispatch(loginFailure(errorMessage));
        throw new Error(errorMessage);
      }
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
