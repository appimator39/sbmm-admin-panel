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
import { useUsers } from 'src/hooks/use-users';

// ----------------------------------------------------------------------

export type UserProps = {
  id: string;
  name: string;
  role: string;
  status: string;
  email: string;
  avatarUrl: string;
  isVerified: boolean;
  batch: string;
};

type UserTableRowProps = {
  row: UserProps;
  selected: boolean;
  onSelectRow: () => void;
  onDeleteUser: (userId: string) => void;
};

export function UserTableRow({ row, selected, onSelectRow, onDeleteUser }: UserTableRowProps) {
  const {
    blockUser,
    unblockUser,
    blockUserLoading,
    blockUserError,
    resetHardwareIds,
    resetHardwareLoading,
    resetHardwareError,
    deleteUserLoading,
    deleteUserError,
  } = useUsers(0, 25);
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [userStatus, setUserStatus] = useState(row.status);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleBlockUser = async () => {
    if (userStatus === 'Blocked') {
      await unblockUser(row.id);
      if (blockUserError) {
        setSnackbarMessage(blockUserError);
        setSnackbarSeverity('error');
      } else {
        setSnackbarMessage('User unblocked successfully');
        setSnackbarSeverity('success');
        setUserStatus('Active');
      }
    } else {
      await blockUser(row.id);
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
    await resetHardwareIds(row.id, data);
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
          {row.isVerified ? (
            <Iconify width={22} icon="solar:check-circle-bold" sx={{ color: 'success.main' }} />
          ) : (
            '-'
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
          <MenuItem onClick={handleClosePopover}>
            <Iconify icon="eva:edit-2-fill" />
            Edit
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
    </>
  );
}
