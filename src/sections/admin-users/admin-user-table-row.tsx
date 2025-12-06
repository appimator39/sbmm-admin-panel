import { useState, useCallback } from 'react';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Popover from '@mui/material/Popover';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Iconify } from 'src/components/iconify';

import type { AdminUser } from 'src/hooks/use-admin-users';

interface AdminUserTableRowProps {
  row: AdminUser;
  onEditPermissions: (user: AdminUser) => void;
  onDelete: (userId: string) => void;
}

export function AdminUserTableRow({ row, onEditPermissions, onDelete }: AdminUserTableRowProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleEditPermissions = () => {
    onEditPermissions(row);
    handleClosePopover();
  };

  const handleDelete = () => {
    onDelete(row._id);
    handleClosePopover();
  };

  // Generate avatar URL from name
  const avatarUrl =
    row.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(row.name)}&background=random`;

  return (
    <>
      <TableRow hover>
        <TableCell component="th" scope="row">
          <Box gap={2} display="flex" alignItems="center">
            <Avatar alt={row.name} src={avatarUrl} />
            <Box>
              <Typography variant="subtitle2">{row.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {row.email}
              </Typography>
            </Box>
          </Box>
        </TableCell>

        <TableCell>
          <Chip label={row.role} size="small" color="primary" variant="outlined" />
        </TableCell>

        <TableCell>
          <Box display="flex" flexWrap="wrap" gap={0.5}>
            {row.permissions.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No permissions
              </Typography>
            ) : (
              <>
                {row.permissions.slice(0, 3).map((perm) => (
                  <Chip
                    key={perm}
                    label={perm.replace(/_/g, ' ')}
                    size="small"
                    variant="outlined"
                    sx={{ textTransform: 'capitalize', fontSize: '0.7rem' }}
                  />
                ))}
                {row.permissions.length > 3 && (
                  <Tooltip title={row.permissions.slice(3).join(', ')}>
                    <Chip
                      label={`+${row.permissions.length - 3} more`}
                      size="small"
                      color="info"
                      variant="filled"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  </Tooltip>
                )}
              </>
            )}
          </Box>
        </TableCell>

        <TableCell align="center">
          <Typography variant="body2" color="text.secondary">
            {row.permissions.length}
          </Typography>
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
            width: 160,
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
          <MenuItem onClick={handleEditPermissions}>
            <Iconify icon="mdi:shield-account" />
            Permissions
          </MenuItem>

          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <Iconify icon="eva:trash-2-outline" />
            Delete
          </MenuItem>
        </MenuList>
      </Popover>
    </>
  );
}
