import { useScrollToTop } from 'src/hooks/use-scroll-to-top';
import { Router } from 'src/routes/sections';
import { ThemeProvider } from 'src/theme/theme-provider';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess } from 'src/store/userSlice';
import type { User } from 'src/models/loginResponse';

import 'src/global.css';

export default function App() {
  useScrollToTop();

  const dispatch = useDispatch();

  const decodeToken = (t: string) => {
    try {
      return JSON.parse(atob(t.split('.')[1]));
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const payload = decodeToken(token);
    if (!payload) return;
    const user: User = {
      email: payload.email || '',
      userId: payload.userId || payload.sub || '',
      role: payload.role || '',
      name: payload.name || '',
      userAvatar: payload.userAvatar || '',
      permissions: payload.permissions || [],
    } as any;
    dispatch(loginSuccess({ token, user }));
  }, [dispatch]);

  return (
    <ThemeProvider>
      <Router />
    </ThemeProvider>
  );
}
