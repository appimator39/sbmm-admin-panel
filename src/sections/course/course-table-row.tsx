import { useState } from 'react';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { fDate } from 'src/utils/format-time';

// ----------------------------------------------------------------------

export type CourseProps = {
  id: string;
  title: string;
  isPublished: boolean;
  createdAt: string;
};

type CourseTableRowProps = {
  row: CourseProps;
  selected: boolean;
  onSelectRow: () => void;
  onDeleteRow: () => void;
  onTogglePublish: () => void;
  deleteLoading: boolean;
  togglePublishLoading: boolean;
};

export default function CourseTableRow({
  row,
  selected,
  onSelectRow,
  onDeleteRow,
  onTogglePublish,
  deleteLoading,
  togglePublishLoading,
}: CourseTableRowProps) {
  const { title, isPublished, createdAt, id } = row;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenConfirm = () => {
    handleMenuClose();
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleDeleteRow = async () => {
    try {
      await onDeleteRow();
      setSnackbar({
        open: true,
        message: 'Course deleted successfully',
        severity: 'success',
      });
      handleCloseConfirm();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to delete course',
        severity: 'error',
      });
    }
  };

  const handleTogglePublish = async () => {
    try {
      await onTogglePublish();
      setSnackbar({
        open: true,
        message: `Course ${isPublished ? 'unpublished' : 'published'} successfully`,
        severity: 'success',
      });
      handleMenuClose();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to toggle course publish status',
        severity: 'error',
      });
    }
  };


  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="subtitle2" noWrap>
              {title}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell>
          <Label color={isPublished ? 'success' : 'error'}>
            {isPublished ? 'Published' : 'Draft'}
          </Label>
        </TableCell>

        <TableCell>{fDate(createdAt)}</TableCell>

        <TableCell align="right">
          <IconButton onClick={handleMenuOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{
              sx: { width: 140 },
            }}
          >
            <MenuItem
              onClick={handleTogglePublish}
              disabled={togglePublishLoading}
              sx={{ color: 'primary.main' }}
            >
              {togglePublishLoading ? (
                <CircularProgress size={20} sx={{ mr: 2 }} />
              ) : (
                <Iconify
                  icon={isPublished ? 'eva:eye-off-outline' : 'eva:eye-outline'}
                  sx={{ mr: 2 }}
                />
              )}
              {isPublished ? 'Unpublish' : 'Publish'}
            </MenuItem>

            <MenuItem onClick={handleOpenConfirm} sx={{ color: 'error.main' }}>
              <Iconify icon="solar:trash-bin-trash-bold" sx={{ mr: 2 }} />
              Delete
            </MenuItem>
          </Menu>
        </TableCell>
      </TableRow>

      <Dialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Delete Course</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this course?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm}>Cancel</Button>
          <Button
            color="error"
            onClick={handleDeleteRow}
            disabled={deleteLoading}
            startIcon={deleteLoading && <CircularProgress size={20} />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

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
    </>
  );
}
