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
import { fDate } from 'src/utils/format-time';

import { AssignCoursesModal } from './view/AssignCoursesModal';
import { EnrollStudentsModal } from './view/EnrollStudentsModal';
import { ExportStudentsModal } from './view/ExportStudentsModal';
import { RemoveStudentModal } from './view/RemoveStudentModal';
import { ViewCoursesModal } from './view-courses-modal';

// ----------------------------------------------------------------------

type BulkRemoveData = {
  successful: Array<{ email: string; userId?: string }>;
  skipped: Array<{ email: string; reason: string }>;
  failed: Array<{ email: string; reason: string }>;
  batchId: string;
  totalStudentsInBatch: number;
  summary: { total: number; removed: number; skipped: number; failed: number };
};

export type BatchProps = {
  id: string;
  title: string;
  description: string;
  students: string[];
  courses: string[];
  createdAt: string;
};

type BatchTableRowProps = {
  row: BatchProps;
  selected: boolean;
  onSelectRow: () => void;
  onDeleteRow: () => void;
  deleteLoading: boolean;
  onEnrollStudents: (batchId: string, emails: string[]) => Promise<void>;
  onAssignCourses: (batchId: string, courseId: string) => Promise<void>;
  onRemoveStudent: (batchId: string, emails: string[]) => Promise<BulkRemoveData>;
};

export default function BatchTableRow({
  row,
  selected,
  onSelectRow,
  onDeleteRow,
  deleteLoading,
  onEnrollStudents,
  onAssignCourses,
  onRemoveStudent,
}: BatchTableRowProps) {
  const { id, title, description, students, courses, createdAt } = row;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openEnrollModal, setOpenEnrollModal] = useState(false);
  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [openRemoveModal, setOpenRemoveModal] = useState(false);
  const [openViewCoursesModal, setOpenViewCoursesModal] = useState(false);
  const [openExportModal, setOpenExportModal] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
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

  const handleOpenEnrollModal = () => {
    handleMenuClose();
    setOpenEnrollModal(true);
  };

  const handleCloseEnrollModal = () => {
    setOpenEnrollModal(false);
    setEnrollError(null);
  };

  const handleOpenAssignModal = () => {
    handleMenuClose();
    setOpenAssignModal(true);
  };

  const handleCloseAssignModal = () => {
    setOpenAssignModal(false);
    setAssignError(null);
  };

  const handleOpenRemoveModal = () => {
    handleMenuClose();
    setOpenRemoveModal(true);
  };

  const handleCloseRemoveModal = () => {
    setOpenRemoveModal(false);
    setRemoveError(null);
  };

  const handleOpenViewCoursesModal = () => {
    handleMenuClose();
    setOpenViewCoursesModal(true);
  };

  const handleCloseViewCoursesModal = () => {
    setOpenViewCoursesModal(false);
  };

  const handleOpenExportModal = () => {
    handleMenuClose();
    setOpenExportModal(true);
  };

  const handleCloseExportModal = () => {
    setOpenExportModal(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleDeleteRow = async () => {
    try {
      await onDeleteRow();
      setSnackbar({
        open: true,
        message: 'Batch deleted successfully',
        severity: 'success',
      });
      handleCloseConfirm();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to delete batch',
        severity: 'error',
      });
    }
  };

  const handleEnrollStudents = async (data: { emails: string[] }) => {
    setEnrollLoading(true);
    setEnrollError(null);
    try {
      await onEnrollStudents(id, data.emails);
      setSnackbar({
        open: true,
        message: 'Students enrolled successfully',
        severity: 'success',
      });
      handleCloseEnrollModal();
    } catch (error) {
      const errorMessage = error.message || 'Failed to enroll students';
      setEnrollError(errorMessage);

      if (errorMessage.includes('already enrolled in this batch')) {
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'error',
        });
      }
    } finally {
      setEnrollLoading(false);
    }
  };

  const handleAssignCourses = async (data: { courseId: string }) => {
    setAssignLoading(true);
    setAssignError(null);
    try {
      await onAssignCourses(id, data.courseId);
      setSnackbar({
        open: true,
        message: 'Course assigned successfully',
        severity: 'success',
      });
      handleCloseAssignModal();
    } catch (error) {
      setAssignError('Failed to assign course');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleRemoveStudent = async (data: { emails: string[] }): Promise<BulkRemoveData> => {
    setRemoveLoading(true);
    setRemoveError(null);
    try {
      const result = await onRemoveStudent(id, data.emails);
      const { summary } = result;
      const message = `Removed: ${summary.removed}, Skipped: ${summary.skipped}, Failed: ${summary.failed}`;
      setSnackbar({ open: true, message, severity: summary.failed > 0 ? 'error' : 'success' });
      return result;
    } catch (error) {
      const errorMessage = error.message || 'Failed to remove students';
      setRemoveError(errorMessage);
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      throw error;
    } finally {
      setRemoveLoading(false);
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

        <TableCell>{description}</TableCell>

        <TableCell>{students.length}</TableCell>

        <TableCell>{courses.length}</TableCell>

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
              sx: { width: 160 },
            }}
          >
            <MenuItem onClick={handleOpenEnrollModal}>
              <Iconify icon="mdi:account-plus" sx={{ mr: 2 }} />
              Enroll Students
            </MenuItem>

            <MenuItem onClick={handleOpenRemoveModal}>
              <Iconify icon="mdi:account-remove" sx={{ mr: 2 }} />
              Remove Students
            </MenuItem>

            <MenuItem onClick={handleOpenAssignModal}>
              <Iconify icon="mdi:book-plus-multiple" sx={{ mr: 2 }} />
              Assign Courses
            </MenuItem>

            <MenuItem onClick={handleOpenViewCoursesModal}>
              <Iconify icon="mdi:book-open" sx={{ mr: 2 }} />
              View Courses
            </MenuItem>

            <MenuItem onClick={handleOpenExportModal} disabled={students.length === 0}>
              <Iconify icon="mdi:download" sx={{ mr: 2 }} />
              Export Emails
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
        <DialogTitle id="alert-dialog-title">Delete Batch</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this batch?
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

      <EnrollStudentsModal
        open={openEnrollModal}
        onClose={handleCloseEnrollModal}
        onSubmit={handleEnrollStudents}
        loading={enrollLoading}
        error={enrollError}
      />

      <AssignCoursesModal
        open={openAssignModal}
        onClose={handleCloseAssignModal}
        onSubmit={handleAssignCourses}
        loading={assignLoading}
        error={assignError}
      />

      <RemoveStudentModal
        open={openRemoveModal}
        onClose={handleCloseRemoveModal}
        onSubmit={handleRemoveStudent}
        loading={removeLoading}
        error={removeError}
      />

      <ViewCoursesModal
        open={openViewCoursesModal}
        onClose={handleCloseViewCoursesModal}
        batchId={id}
        batchTitle={title}
        courseIds={courses}
      />

      <ExportStudentsModal
        open={openExportModal}
        onClose={handleCloseExportModal}
        batchId={id}
        batchTitle={title}
        totalStudents={students.length}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            whiteSpace: 'pre-line',
            '& .MuiAlert-message': {
              maxHeight: '200px',
              overflow: 'auto',
            },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
