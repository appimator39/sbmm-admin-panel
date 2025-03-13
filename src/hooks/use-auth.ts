import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export function useAuth() {
  const navigate = useNavigate();

  const isAuthenticated = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    return Boolean(token);
  }, []);

  const login = useCallback(
    (token: string) => {
      localStorage.setItem('accessToken', token);
      navigate('/', { replace: true });
    },
    [navigate]
  );

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    navigate('/sign-in', { replace: true });
  }, [navigate]);

  return {
    isAuthenticated,
    login,
    logout,
  };
}
