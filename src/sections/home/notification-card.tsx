import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';

import { LoadingButton } from '@mui/lab';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import httpService from 'src/services/httpService';
import type { RootState } from 'src/store/store';

interface Notification {
  title: string;
  description: string;
}

interface ApiResponse {
  statusCode: number;
  message: string;
  data: Notification;
}

interface ApiError {
  message: string;
  response?: {
    data?: {
      message?: string;
    };
  };
}

export function NotificationCard() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [notification, setNotification] = useState<Notification>({
    title: '',
    description: '',
  });
  const [editForm, setEditForm] = useState<Notification>({
    title: '',
    description: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const user = useSelector((state: RootState) => state.user.user);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const fetchNotification = useCallback(async () => {
    setFetchLoading(true);
    try {
      const response = await httpService.get<ApiResponse>('/notifications');
      setNotification(response.data.data);
      setEditForm(response.data.data);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Failed to fetch notification:', apiError);
      showSnackbar(apiError.response?.data?.message || 'Failed to fetch notification', 'error');
    } finally {
      setFetchLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotification();
  }, [fetchNotification]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        title: editForm.title,
        description: editForm.description,
      };
      const response = await httpService.post<ApiResponse>('/notifications', payload);
      setNotification(response.data.data);
      setIsEditing(false);
      showSnackbar('Notification updated successfully', 'success');
      fetchNotification(); // Refresh the notification after saving
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Failed to update notification:', apiError);
      showSnackbar(apiError.response?.data?.message || 'Failed to update notification', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <Card
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 200,
        }}
      >
        <CircularProgress />
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader
          title="Notification Board"
          action={
            user?.role === 'admin' && (
              <IconButton
                onClick={() => setIsEditing(true)}
                sx={{
                  width: 40,
                  height: 40,
                  color: 'text.secondary',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Iconify icon="solar:pen-bold" width={20} />
              </IconButton>
            )
          }
        />

        <CardContent>
          <Stack spacing={2}>
            {notification.title ? (
              <>
                <Typography variant="h6" color="primary">
                  {notification.title}
                </Typography>
                <Typography variant="body2">
                  {notification.description}
                </Typography>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary" align="center">
                No notification available
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Dialog open={isEditing} onClose={() => setIsEditing(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Notification</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={4}
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditing(false)} color="inherit">
            Cancel
          </Button>
          <LoadingButton loading={loading} variant="contained" onClick={handleSave}>
            Save Changes
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
