import { useState, useCallback } from 'react';

import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Popover from '@mui/material/Popover';
import Snackbar from '@mui/material/Snackbar';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { ViewCnicModal } from './view/ViewCnicModal';
import { EditUserModal } from './view/EditUserModal';

// ----------------------------------------------------------------------

export type UserProps = {
  id: string;
  _id: string;
  name: string;
  role: string;
  status: string;
  email: string;
  avatarUrl: string;
  idVerified: boolean;
  batch: string;
  fatherName: string;
  gender: string;
  phoneNumber: string;
  whatsapp: string;
  rollNo: string;
  facebookProfileUrl: string;
  address: string;
};

type UserTableRowProps = {
  row: UserProps;
  selected: boolean;
  onSelectRow: () => void;
  onDeleteUser: (userId: string) => void;
  onBlockUser: (userId: string) => Promise<void>;
  onUnblockUser: (userId: string) => Promise<void>;
  onResetHardwareIds: (userId: string, data: any) => Promise<void>;
  onVerificationChange: (userId: string, verified: boolean) => void;
  onUpdateUser: (userId: string, data: any) => Promise<void>;
  blockUserLoading: boolean;
  blockUserError: string | null;
  resetHardwareError: string | null;
  deleteUserError: string | null;
  updateUserLoading: boolean;
};

export function UserTableRow({ 
  row, 
  selected, 
  onSelectRow, 
  onDeleteUser,
  onBlockUser,
  onUnblockUser,
  onResetHardwareIds,
  onVerificationChange,
  onUpdateUser,
  blockUserLoading,
  blockUserError,
  resetHardwareError,
  deleteUserError,
  updateUserLoading,
}: UserTableRowProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [userStatus, setUserStatus] = useState(row.status);
  const [openCnicModal, setOpenCnicModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleBlockUser = async () => {
    if (userStatus === 'Blocked') {
      await onUnblockUser(row.id);
      if (blockUserError) {
        setSnackbarMessage(blockUserError);
        setSnackbarSeverity('error');
      } else {
        setSnackbarMessage('User unblocked successfully');
        setSnackbarSeverity('success');
        setUserStatus('Active');
      }
    } else {
      await onBlockUser(row.id);
      if (blockUserError) {
        setSnackbarMessage(blockUserError);
        setSnackbarSeverity('error');
      } else {
        setSnackbarMessage('User blocked successfully');
        setSnackbarSeverity('success');
        setUserStatus('Blocked');
      }
    }
    setSnackbarOpen(true);
    handleClosePopover();
  };

  const handleResetHardwareIds = async (data: any) => {
    await onResetHardwareIds(row.id, data);
    if (resetHardwareError) {
      setSnackbarMessage(resetHardwareError);
      setSnackbarSeverity('error');
    } else {
      setSnackbarMessage('Hardware ID reset successfully');
      setSnackbarSeverity('success');
    }
    setSnackbarOpen(true);
    handleClosePopover();
  };

  const handleDeleteUser = async () => {
    await onDeleteUser(row.id);
    if (deleteUserError) {
      setSnackbarMessage(deleteUserError);
      setSnackbarSeverity('error');
    } else {
      setSnackbarMessage('User deleted successfully');
      setSnackbarSeverity('success');
    }
    setSnackbarOpen(true);
    handleClosePopover();
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleUpdateUser = async (data: any) => {
    try {
      await onUpdateUser(row.id, data);
      setSnackbarMessage('User updated successfully');
      setSnackbarSeverity('success');
    } catch (error) {
      setSnackbarMessage('Failed to update user');
      setSnackbarSeverity('error');
    }
    setSnackbarOpen(true);
  };

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
        </TableCell>

        <TableCell component="th" scope="row">
          <Box gap={2} display="flex" alignItems="center">
            <Avatar alt={row.name} src={row.avatarUrl} />
            {row.name}
          </Box>
        </TableCell>

        <TableCell>{row.email}</TableCell>

        <TableCell>{row.batch && row.batch.trim() !== '' ? row.batch : '--'}</TableCell>

        <TableCell align="center">
          {row.idVerified ? (
            <Iconify width={22} icon="solar:check-circle-bold" sx={{ color: 'success.main' }} />
          ) : (
            <Iconify width={22} icon="solar:close-circle-bold" sx={{ color: 'error.main' }} />
          )}
        </TableCell>

        <TableCell>
          <Label color={(userStatus === 'Blocked' && 'error') || 'success'}>{userStatus}</Label>
        </TableCell>

        <TableCell align="right">
          <IconButton onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuList
          disablePadding
          sx={{
            p: 0.5,
            gap: 0.5,
            width: 180,
            display: 'flex',
            flexDirection: 'column',
            [`& .${menuItemClasses.root}`]: {
              px: 1,
              gap: 2,
              borderRadius: 0.75,
              [`&.${menuItemClasses.selected}`]: { bgcolor: 'action.selected' },
            },
          }}
        >
          <MenuItem onClick={() => {
            setOpenEditModal(true);
            handleClosePopover();
          }}>
            <Iconify icon="eva:edit-2-fill" />
            Edit
          </MenuItem>

          <MenuItem onClick={() => {
            setOpenCnicModal(true);
            handleClosePopover();
          }}>
            <Iconify icon="mdi:id-card" />
            View CNIC
          </MenuItem>

          <MenuItem onClick={handleDeleteUser} sx={{ color: 'error.main' }}>
            <Iconify icon="eva:trash-2-outline" />
            Delete
          </MenuItem>

          <MenuItem
            onClick={() => handleResetHardwareIds({ resetAndroid: true })}
            sx={{ color: 'primary.main' }}
          >
            <Iconify icon="mdi:android" />
            Clear Android
          </MenuItem>

          <MenuItem
            onClick={() => handleResetHardwareIds({ resetIOS: true })}
            sx={{ color: 'primary.main' }}
          >
            <Iconify icon="mdi:apple-ios" />
            Clear iOS
          </MenuItem>

          <MenuItem
            onClick={() => handleResetHardwareIds({ resetMac: true })}
            sx={{ color: 'primary.main' }}
          >
            <Iconify icon="mdi:apple" />
            Clear macOS
          </MenuItem>

          <MenuItem
            onClick={() => handleResetHardwareIds({ resetWindows: true })}
            sx={{ color: 'primary.main' }}
          >
            <Iconify icon="mdi:microsoft-windows" />
            Clear Windows
          </MenuItem>

          <MenuItem onClick={handleBlockUser} sx={{ color: 'warning.main' }}>
            {blockUserLoading ? (
              <CircularProgress size={20} />
            ) : (
              <>
                <Iconify
                  icon={userStatus === 'Blocked' ? 'eva:unlock-outline' : 'eva:lock-outline'}
                />
                {userStatus === 'Blocked' ? 'Unblock' : 'Block'}
              </>
            )}
          </MenuItem>
        </MenuList>
      </Popover>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <ViewCnicModal
        open={openCnicModal}
        onClose={() => setOpenCnicModal(false)}
        userId={row.id}
        idVerified={row.idVerified}
        onVerificationChange={(verified) => {
          onVerificationChange(row.id, verified);
        }}
      />

      <EditUserModal
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        user={row}
        onUpdate={handleUpdateUser}
        loading={updateUserLoading}
      />
    </>
  );
}
