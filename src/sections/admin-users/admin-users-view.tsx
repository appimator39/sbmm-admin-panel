import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { DashboardContent } from 'src/layouts/dashboard';
import { useAdminUsers } from 'src/hooks/use-admin-users';

import type { AdminUser } from 'src/hooks/use-admin-users';

import { AdminUserTableRow } from './admin-user-table-row';
import { CreateAdminUserModal } from './CreateAdminUserModal';
import { EditPermissionsModal } from './EditPermissionsModal';

// ----------------------------------------------------------------------

export function AdminUsersView() {
  const {
    adminUsers,
    loading,
    error,
    catalog,
    catalogLoading,
    createLoading,
    createError,
    updateLoading,
    updateError,
    deleteLoading,
    deleteError,
    // Pagination
    page,
    limit,
    total,
    setPage,
    setLimit,
    // Actions
    fetchAdminUsers,
    fetchPermissionsCatalog,
    createAdminUser,
    updateAdminPermissions,
    deleteAdminUser,
  } = useAdminUsers();

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Load permissions catalog when modals open
  useEffect(() => {
    if (openCreateModal || openEditModal) {
      fetchPermissionsCatalog();
    }
  }, [openCreateModal, openEditModal, fetchPermissionsCatalog]);

  const handleOpenCreateModal = () => setOpenCreateModal(true);
  const handleCloseCreateModal = () => setOpenCreateModal(false);

  const handleOpenEditModal = (user: AdminUser) => {
    setSelectedUser(user);
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setSelectedUser(null);
  };

  const handleCreateAdminUser = async (data: {
    email: string;
    password: string;
    permissions: string[];
  }) => {
    try {
      await createAdminUser(data);
      setSnackbar({
        open: true,
        message: 'Admin user created successfully',
        severity: 'success',
      });
      handleCloseCreateModal();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to create admin user',
        severity: 'error',
      });
    }
  };

  const handleUpdatePermissions = async (userId: string, permissions: string[]) => {
    try {
      await updateAdminPermissions(userId, permissions);
      setSnackbar({
        open: true,
        message: 'Permissions updated successfully',
        severity: 'success',
      });
      handleCloseEditModal();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to update permissions',
        severity: 'error',
      });
    }
  };

  const handleDeleteClick = (userId: string) => {
    setUserToDelete(userId);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteAdminUser(userToDelete);
      setSnackbar({
        open: true,
        message: 'Admin user deleted successfully',
        severity: 'success',
      });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to delete admin user',
        severity: 'error',
      });
    } finally {
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setUserToDelete(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleChangePage = useCallback(
    (event: unknown, newPage: number) => {
      setPage(newPage);
    },
    [setPage]
  );

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setLimit(parseInt(event.target.value, 10));
    },
    [setLimit]
  );

  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>
          Admin Users
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleOpenCreateModal}
        >
          New Admin User
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
                    <TableCell>Admin User</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Permissions</TableCell>
                    <TableCell align="center">Count</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {adminUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                        <Box>
                          <Iconify
                            icon="mdi:account-group-outline"
                            width={64}
                            sx={{ color: 'text.secondary', mb: 2 }}
                          />
                          <Typography variant="h6" color="text.secondary">
                            No admin users found
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Create your first admin user to get started
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    adminUsers.map((user) => (
                      <AdminUserTableRow
                        key={user._id}
                        row={user}
                        onEditPermissions={handleOpenEditModal}
                        onDelete={handleDeleteClick}
                      />
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
          count={total}
          rowsPerPage={limit}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      <CreateAdminUserModal
        open={openCreateModal}
        onClose={handleCloseCreateModal}
        onSubmit={handleCreateAdminUser}
        catalog={catalog}
        catalogLoading={catalogLoading}
        loading={createLoading}
        error={createError}
      />

      <EditPermissionsModal
        open={openEditModal}
        onClose={handleCloseEditModal}
        adminUser={selectedUser}
        onSubmit={handleUpdatePermissions}
        catalog={catalog}
        catalogLoading={catalogLoading}
        loading={updateLoading}
        error={updateError}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={handleCancelDelete}
        title="Delete Admin User"
        content="Are you sure you want to delete this admin user? This action cannot be undone."
        action={
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={18} /> : null}
          >
            Delete
          </Button>
        }
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardContent>
  );
}
