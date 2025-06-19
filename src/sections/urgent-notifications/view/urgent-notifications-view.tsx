import { useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import Typography from '@mui/material/Typography';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';
import Chip from '@mui/material/Chip';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { DashboardContent } from 'src/layouts/dashboard';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import httpService from 'src/services/httpService';
import { UrgentNotification, NotificationResponse } from '../types';
import { AddUrgentNotificationModal } from './AddUrgentNotificationModal';

// ----------------------------------------------------------------------

export function UrgentNotificationsView() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [notifications, setNotifications] = useState<UrgentNotification[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    notificationId: string;
    title: string;
  }>({
    open: false,
    notificationId: '',
    title: '',
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await httpService.get<NotificationResponse>(
        `/notifications/admin/all?page=${page + 1}&limit=${rowsPerPage}`
      );
      console.log('API Response:', response.data);
      
      // Check if response has expected structure
      if (response.data?.data?.notifications) {
        setNotifications(response.data.data.notifications);
        setTotalCount(response.data.data.pagination?.totalCount || 0);
      } else {
        console.error('Unexpected API response structure:', response.data);
        setError('Unexpected response format from server');
        setNotifications([]);
        setTotalCount(0);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteClick = (notificationId: string, title: string) => {
    setConfirmDialog({
      open: true,
      notificationId,
      title,
    });
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await httpService.delete(`/notifications/realtime/${confirmDialog.notificationId}`);
      setSnackbar({
        open: true,
        message: 'Notification deleted successfully',
        severity: 'success',
      });
      await fetchNotifications();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to delete notification',
        severity: 'error',
      });
      console.error('Error deleting notification:', err);
    } finally {
      setDeleteLoading(false);
      setConfirmDialog({ open: false, notificationId: '', title: '' });
    }
  };

  const handleDeleteCancel = () => {
    setConfirmDialog({ open: false, notificationId: '', title: '' });
  };

  const handleNotificationAdded = () => {
    setSnackbar({
      open: true,
      message: 'Notification created successfully',
      severity: 'success',
    });
    fetchNotifications();
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleString();

  const renderReadStatus = (isRead: boolean) => {
    if (isRead) {
      return (
        <Chip
          icon={<Iconify icon="solar:check-circle-bold" />}
          label="Read"
          color="success"
          variant="outlined"
          size="small"
          sx={{ 
            backgroundColor: 'success.lighter',
            borderColor: 'success.main',
            '& .MuiChip-icon': { color: 'success.main' }
          }}
        />
      );
    }
    return (
      <Chip
        icon={<Iconify icon="solar:notification-unread-bold" />}
        label="Unread"
        color="warning"
        variant="outlined"
        size="small"
        sx={{ 
          backgroundColor: 'warning.lighter',
          borderColor: 'warning.main',
          '& .MuiChip-icon': { color: 'warning.main' }
        }}
      />
    );
  };

  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>
          Notifications
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleOpenModal}
        >
          New Notification
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height={400}>
                <CircularProgress />
              </Box>
            ) : (
              <Table sx={{ minWidth: 800 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Created By</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="center">Read Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {notifications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                          <Iconify icon="solar:notification-unread-bold" width={64} sx={{ color: 'text.disabled' }} />
                          <Typography variant="h6" color="text.secondary">
                            No notifications found
                          </Typography>
                          <Typography variant="body2" color="text.disabled">
                            Create your first notification to get started
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    notifications.map((notification) => (
                      <TableRow key={notification._id} hover>
                        <TableCell>
                          <Typography variant="subtitle2" noWrap>
                            {notification.title}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 400 }}>
                            {notification.description}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {notification.user?.name || 'Unknown User'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {notification.user?.email || 'No email'}
                            </Typography>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(notification.createdAt)}
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          {renderReadStatus(notification.isRead)}
                        </TableCell>

                        <TableCell align="right">
                          <Tooltip title="Delete notification">
                            <IconButton
                              onClick={() => handleDeleteClick(notification._id, notification.title)}
                              color="error"
                              disabled={deleteLoading}
                            >
                              <Iconify icon="solar:trash-bin-trash-bold" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        </Scrollbar>

        <TablePagination
          component="div"
          page={page}
          count={totalCount}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 20, 50]}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      <AddUrgentNotificationModal
        open={openModal}
        onClose={handleCloseModal}
        onNotificationAdded={handleNotificationAdded}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        onClose={handleDeleteCancel}
        title="Delete Notification"
        content={`Are you sure you want to delete "${confirmDialog.title}"? This action cannot be undone.`}
        action={
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={20} /> : <Iconify icon="solar:trash-bin-trash-bold" />}
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        }
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardContent>
  );
} 