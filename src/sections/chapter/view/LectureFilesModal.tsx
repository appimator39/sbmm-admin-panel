import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Tabs,
  Tab,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import httpService from 'src/services/httpService';

interface LectureFile {
  _id: string;
  name: string;
  title: string;
  description: string;
  filePath: string;
  lectureId: string;
  createdAt: string;
  updatedAt: string;
}

interface LectureFilesResponse {
  statusCode: number;
  message: string;
  data: LectureFile[];
}

interface LectureFilesModalProps {
  open: boolean;
  onClose: () => void;
  lectureId: string;
  lectureTitle: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function LectureFilesModal({ open, onClose, lectureId, lectureTitle }: LectureFilesModalProps) {
  const [files, setFiles] = useState<LectureFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const fetchFiles = useCallback(async () => {
    try {
        
      const response = await httpService.get<LectureFilesResponse>(`/lecture/${lectureId}/files`);
      if (response.data.statusCode === 200) {
        setFiles(response.data.data);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch files',
        severity: 'error',
      });
    }
  }, [lectureId]);

  useEffect(() => {
    if (open) {
      // Reset the files list and fetch new data
      setFiles([]);
      fetchFiles();
    }
  }, [open, lectureId, fetchFiles]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleDeleteFile = async (fileId: string) => {
    setDeleteLoading(fileId);
    try {
      await httpService.delete(`/lecture/files/${fileId}`);
      setFiles((prev) => prev.filter((f) => f._id !== fileId));
      setSnackbar({
        open: true,
        message: 'File deleted successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete file',
        severity: 'error',
      });
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleSubmit = async () => {
    if (!file || !title) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields and select a file',
        severity: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('createLectureFileDto', JSON.stringify({
        title,
        description,
      }));

      await httpService.post(`/lecture/${lectureId}/files`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSnackbar({
        open: true,
        message: 'File uploaded successfully',
        severity: 'success',
      });
      // Reset form
      setTitle('');
      setDescription('');
      setFile(null);
      // Fetch updated files list
      await fetchFiles();
      // Switch back to files list
      setTabValue(0);
    } catch (error) {
      console.error('Error uploading file:', error);
      setSnackbar({
        open: true,
        message: 'Failed to upload file',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Manage Lecture Files
          <Typography variant="subtitle2" color="text.secondary">
            {lectureTitle}
          </Typography>
        </DialogTitle>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="basic tabs example">
            <Tab label="Files" />
            <Tab label="Add New File" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <List>
            {files.map((lectureFile) => (
              <div key={lectureFile._id}>
                <ListItem>
                  <ListItemText
                    primary={lectureFile.title}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {lectureFile.description}
                        </Typography>
                        <br />
                        <Typography component="span" variant="caption" color="text.secondary">
                          {new Date(lectureFile.createdAt).toLocaleDateString()}
                        </Typography>
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDeleteFile(lectureFile._id)}
                      disabled={deleteLoading === lectureFile._id}
                    >
                      {deleteLoading === lectureFile._id ? (
                        <CircularProgress size={20} />
                      ) : (
                        <Iconify icon="solar:trash-bin-trash-bold" />
                      )}
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
              </div>
            ))}
            {files.length === 0 && (
              <Typography variant="body2" color="text.secondary" align="center">
                No files found
              </Typography>
            )}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <TextField
              fullWidth
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={3}
            />

            <Box sx={{ mt: 2 }}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<Iconify icon="mdi:file-upload" />}
              >
                Select File
                <input
                  type="file"
                  hidden
                  onChange={handleFileChange}
                  accept=".pdf"
                />
              </Button>
              {file && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Selected file: {file.name}
                </Typography>
              )}
            </Box>
          </Box>
        </TabPanel>

        <DialogActions>
          <Button onClick={onClose}>Close</Button>
          {tabValue === 1 && (
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={loading || !file || !title}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              Upload
            </Button>
          )}
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