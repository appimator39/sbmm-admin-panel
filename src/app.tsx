import { useScrollToTop } from 'src/hooks/use-scroll-to-top';
import { Router } from 'src/routes/sections';
import { ThemeProvider } from 'src/theme/theme-provider';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess } from 'src/store/userSlice';
import Snackbar from '@mui/material/Snackbar';
import type { User } from 'src/models/loginResponse';

import 'src/global.css';

export default function App() {
  useScrollToTop();

  const dispatch = useDispatch();
  const [permissionError, setPermissionError] = useState<string | null>(null);

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

  // Listen for permission errors from httpService
  useEffect(() => {
    const handlePermissionError = (event: CustomEvent<{ message: string }>) => {
      setPermissionError(event.detail.message);
    };

    window.addEventListener('permission-error', handlePermissionError as EventListener);
    return () => {
      window.removeEventListener('permission-error', handlePermissionError as EventListener);
    };
  }, []);

  const handleCloseError = () => {
    setPermissionError(null);
  };

  return (
    <ThemeProvider>
      <Router />

      {/* Global permission error snackbar */}
      <Snackbar
        open={!!permissionError}
        autoHideDuration={4000}
        onClose={handleCloseError}
        message="Access denied"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      />
    </ThemeProvider>
  );
}
