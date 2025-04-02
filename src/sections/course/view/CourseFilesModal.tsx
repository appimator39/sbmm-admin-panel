import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  CircularProgress,
  Alert,
  IconButton,
  Link,
  Chip,
  Snackbar,
  TextField,
  DialogContentText,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { useCourseFiles, CourseFile } from 'src/hooks/use-course-files';
import httpService from 'src/services/httpService';

interface CourseFilesModalProps {
  open: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
}

export function CourseFilesModal({ open, onClose, courseId, courseTitle }: CourseFilesModalProps) {
  const { files, loading, error, fetchCourseFiles } = useCourseFiles(0, 25);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [fileInput, setFileInput] = useState<HTMLInputElement | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isCommon, setIsCommon] = useState(false);
  const [editingFile, setEditingFile] = useState<CourseFile | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchCourseFiles(courseId);
    }
  }, [open, courseId, fetchCourseFiles]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setFileInput(event.target);
    } else {
      setSnackbar({
        open: true,
        message: 'Only PDF files are allowed',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleUpload = async () => {
    if (!fileInput?.files?.[0]) {
      setSnackbar({
        open: true,
        message: 'Please select a file',
        severity: 'error',
      });
      return;
    }

    if (!title.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter a title',
        severity: 'error',
      });
      return;
    }

    setUploadLoading(true);

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('courseId', courseId);
    formData.append('isCommon', String(isCommon));

    try {
      await httpService.post('/course-files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSnackbar({
        open: true,
        message: 'File uploaded successfully',
        severity: 'success',
      });

      // Reset form and close it
      setFileInput(null);
      setTitle('');
      setDescription('');
      setIsCommon(false);
      setShowUploadForm(false);

      // Refresh the files list
      fetchCourseFiles(courseId);
    } catch (uploadError) {
      setSnackbar({
        open: true,
        message: 'Failed to upload file',
        severity: 'error',
      });
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeleteClick = (fileId: string) => {
    setFileToDelete(fileId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!fileToDelete) return;

    setDeleteLoading(fileToDelete);

    try {
      await httpService.delete(`/course-files/${fileToDelete}`);
      setSnackbar({
        open: true,
        message: 'File deleted successfully',
        severity: 'success',
      });
      fetchCourseFiles(courseId);
    } catch (deleteError) {
      setSnackbar({
        open: true,
        message: 'Failed to delete file',
        severity: 'error',
      });
    } finally {
      setDeleteLoading(null);
      setDeleteConfirmOpen(false);
      setFileToDelete(null);
    }
  };

  const handleEditClick = (file: CourseFile) => {
    setEditingFile(file);
  };

  const handleEditClose = () => {
    setEditingFile(null);
  };

  const handleEditSubmit = async () => {
    if (!editingFile) return;

    setEditLoading(true);

    try {
      await httpService.put(`/course-files/${editingFile._id}`, {
        courseId: editingFile.courseId?._id || courseId,
        title: editingFile.title,
        description: editingFile.description,
        isCommon: editingFile.isCommon,
      });

      setSnackbar({
        open: true,
        message: 'File updated successfully',
        severity: 'success',
      });

      handleEditClose();
      fetchCourseFiles(courseId);
    } catch (editError) {
      setSnackbar({
        open: true,
        message: 'Failed to update file',
        severity: 'error',
      });
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="h6">
                Course Files
              </Typography>
              <IconButton 
                onClick={() => setShowUploadForm(!showUploadForm)} 
                color="primary"
              >
                <Iconify icon={showUploadForm ? "mdi:close" : "mdi:plus"} />
              </IconButton>
            </Box>
            <IconButton onClick={onClose}>
              <Iconify icon="mdi:close" />
            </IconButton>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {courseTitle}
          </Typography>
        </DialogTitle>

        <DialogContent>
          {showUploadForm ? (
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle1">
                  Upload New File
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    id="file-upload"
                  />
                  <Button
                    variant="outlined"
                    component="label"
                    htmlFor="file-upload"
                    startIcon={<Iconify icon="mdi:upload" />}
                  >
                    Select PDF File
                  </Button>
                  {fileInput?.files?.[0] && (
                    <Typography variant="body2" color="text.secondary">
                      {fileInput.files[0].name}
                    </Typography>
                  )}
                </Box>

                <TextField
                  label="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  fullWidth
                  required
                />

                <TextField
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  fullWidth
                  multiline
                  rows={2}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isCommon}
                      onChange={(e) => setIsCommon(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Make this file common for all courses"
                />

                <Button
                  variant="contained"
                  onClick={handleUpload}
                  disabled={uploadLoading}
                  startIcon={uploadLoading ? <CircularProgress size={20} /> : <Iconify icon="mdi:upload" />}
                >
                  Upload File
                </Button>
              </Box>
            </Box>
          ) : loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : files.length === 0 ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              p={4}
              sx={{ cursor: 'pointer' }}
              onClick={() => setShowUploadForm(true)}
            >
              <Iconify icon="mdi:plus-circle" sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" color="primary" gutterBottom>
                Add Course Files
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Click here to upload course materials
              </Typography>
            </Box>
          ) : (
            <>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Existing Files
              </Typography>
              <List>
                {files.map((file) => (
                  <ListItem
                    key={file._id}
                    divider
                    sx={{
                      '&:last-child': {
                        borderBottom: 'none',
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle1">
                            {file.title}
                          </Typography>
                          {file.isCommon && (
                            <Chip
                              label="Common"
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {file.description}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1} mt={1}>
                            <Iconify icon="mdi:file-pdf" sx={{ color: 'error.main' }} />
                            <Link
                              href={file.fileLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{ textDecoration: 'none' }}
                            >
                              View File
                            </Link>
                          </Box>
                        </Box>
                      }
                    />
                    <Box>
                      <IconButton
                        onClick={() => handleEditClick(file)}
                        color="primary"
                        sx={{ mr: 1 }}
                      >
                        <Iconify icon="mdi:pencil" />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteClick(file._id)}
                        disabled={deleteLoading === file._id}
                        color="error"
                      >
                        {deleteLoading === file._id ? (
                          <CircularProgress size={20} />
                        ) : (
                          <Iconify icon="mdi:delete" />
                        )}
                      </IconButton>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Delete File</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this file?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button
            color="error"
            onClick={handleDeleteConfirm}
            disabled={!!deleteLoading}
            startIcon={deleteLoading && <CircularProgress size={20} />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!editingFile}
        onClose={handleEditClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit File Details</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Title"
              value={editingFile?.title || ''}
              onChange={(e) => setEditingFile((prev: CourseFile | null) => prev ? { ...prev, title: e.target.value } : null)}
              fullWidth
              required
            />

            <TextField
              label="Description"
              value={editingFile?.description || ''}
              onChange={(e) => setEditingFile((prev: CourseFile | null) => prev ? { ...prev, description: e.target.value } : null)}
              fullWidth
              multiline
              rows={2}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={editingFile?.isCommon || false}
                  onChange={(e) => setEditingFile((prev: CourseFile | null) => prev ? { ...prev, isCommon: e.target.checked } : null)}
                  color="primary"
                />
              }
              label="Make this file common for all courses"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleEditSubmit}
            disabled={editLoading}
            startIcon={editLoading ? <CircularProgress size={20} /> : null}
          >
            Save Changes
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