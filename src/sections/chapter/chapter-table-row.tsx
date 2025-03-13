import { useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
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
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { Iconify } from 'src/components/iconify';
import { fDate } from 'src/utils/format-time';

// ----------------------------------------------------------------------

interface Lecture {
  _id: string;
  title: string;
  createdAt: string;
}

export type ChapterProps = {
  id: string;
  title: string;
  lecturesCount: number;
  courseTitle: string;
  createdAt: string;
  lectures: Lecture[];
};

type ChapterTableRowProps = {
  row: ChapterProps;
  selected: boolean;
  onSelectRow: () => void;
  onDeleteRow: () => void;
  onAddLecture: () => void;
  onDeleteLecture: (lectureId: string) => Promise<void>;
  deleteLoading: boolean;
  togglePublishLoading: boolean;
  deleteLectureLoading: boolean;
};

export default function ChapterTableRow({
  row,
  selected,
  onSelectRow,
  onDeleteRow,
  onAddLecture,
  onDeleteLecture,
  deleteLoading,
  togglePublishLoading,
  deleteLectureLoading,
}: ChapterTableRowProps) {
  const { title, lecturesCount, courseTitle, createdAt, lectures } = row;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState<string | null>(null);
  const [openLectureConfirm, setOpenLectureConfirm] = useState(false);
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
        message: 'Chapter deleted successfully',
        severity: 'success',
      });
      handleCloseConfirm();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to delete chapter',
        severity: 'error',
      });
    }
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const handleDeleteLecture = async () => {
    if (!selectedLecture) return;
    try {
      await onDeleteLecture(selectedLecture);
      setSnackbar({
        open: true,
        message: 'Lecture deleted successfully',
        severity: 'success',
      });
      setOpenLectureConfirm(false);
      setSelectedLecture(null);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to delete lecture',
        severity: 'error',
      });
    }
  };

  const handleOpenLectureConfirm = (lectureId: string) => {
    setSelectedLecture(lectureId);
    setOpenLectureConfirm(true);
  };

  const handleCloseLectureConfirm = () => {
    setOpenLectureConfirm(false);
    setSelectedLecture(null);
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell>
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton
              size="small"
              onClick={toggleExpanded}
              sx={{ transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}
            >
              <Iconify icon="eva:arrow-ios-forward-fill" />
            </IconButton>
            <Typography variant="subtitle2" noWrap>
              {title}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell>{lecturesCount} lectures</TableCell>

        <TableCell>{courseTitle}</TableCell>

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
              onClick={() => {
                handleMenuClose();
                onAddLecture();
              }}
              sx={{ color: 'primary.main' }}
            >
              <Iconify icon="material-symbols:video-library" sx={{ mr: 2 }} />
              Add Lecture
            </MenuItem>

            <MenuItem onClick={handleOpenConfirm} sx={{ color: 'error.main' }}>
              <Iconify icon="solar:trash-bin-trash-bold" sx={{ mr: 2 }} />
              Delete
            </MenuItem>
          </Menu>
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2 }}>
              <Typography variant="h6" gutterBottom component="div">
                Lectures
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lectures?.map((lecture) => (
                    <TableRow key={lecture._id}>
                      <TableCell component="th" scope="row">
                        {lecture.title}
                      </TableCell>
                      <TableCell>{fDate(lecture.createdAt)}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleOpenLectureConfirm(lecture._id)}
                          disabled={deleteLectureLoading && selectedLecture === lecture._id}
                        >
                          {deleteLectureLoading && selectedLecture === lecture._id ? (
                            <CircularProgress size={20} />
                          ) : (
                            <Iconify icon="solar:trash-bin-trash-bold" />
                          )}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!lectures || lectures.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        <Typography variant="body2" color="text.secondary">
                          No lectures available
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>

      <Dialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Delete Chapter</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this chapter?
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

      <Dialog
        open={openLectureConfirm}
        onClose={handleCloseLectureConfirm}
        aria-labelledby="delete-lecture-dialog-title"
        aria-describedby="delete-lecture-dialog-description"
      >
        <DialogTitle id="delete-lecture-dialog-title">Delete Lecture</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-lecture-dialog-description">
            Are you sure you want to delete this lecture?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseLectureConfirm}>Cancel</Button>
          <Button
            color="error"
            onClick={handleDeleteLecture}
            disabled={deleteLectureLoading}
            startIcon={deleteLectureLoading && <CircularProgress size={20} />}
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
