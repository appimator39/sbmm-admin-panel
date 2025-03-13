import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';

import { LoadingButton } from '@mui/lab';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import { Iconify } from 'src/components/iconify';
import httpService from 'src/services/httpService';
import type { RootState } from 'src/store/store';

interface OrganizationInfo {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  statusCode: number;
  message: string;
  data: OrganizationInfo;
}

interface ApiError {
  message: string;
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface FormData {
  title: string;
  description: string;
}

export function OrganizationCard() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [organization, setOrganization] = useState<OrganizationInfo | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    mode: 'onChange',
  });

  const user = useSelector((state: RootState) => state.user.user);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const fetchOrganizationInfo = useCallback(async () => {
    setFetchLoading(true);
    try {
      const response = await httpService.get<ApiResponse>('/org-info');
      setOrganization(response.data.data);
      reset({
        title: response.data.data.title,
        description: response.data.data.description,
      });
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Failed to fetch organization info:', apiError);
      showSnackbar(apiError.response?.data?.message || 'Failed to fetch organization info', 'error');
    } finally {
      setFetchLoading(false);
    }
  }, [reset]);

  useEffect(() => {
    fetchOrganizationInfo();
  }, [fetchOrganizationInfo]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.type.startsWith('video/')) {
        setSelectedFile(file);
      } else {
        showSnackbar('Please select a video file', 'error');
      }
    }
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const response = await httpService.post<ApiResponse>('/org-info', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setOrganization(response.data.data);
      setIsEditing(false);
      showSnackbar('Organization info updated successfully', 'success');
      fetchOrganizationInfo(); // Refresh the info after saving
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Failed to update organization info:', apiError);
      showSnackbar(apiError.response?.data?.message || 'Failed to update organization info', 'error');
    } finally {
      setLoading(false);
      setSelectedFile(null);
    }
  };

  if (fetchLoading) {
    return (
      <Card
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 200,
        }}
      >
        <CircularProgress />
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader
          title="Organization Information"
          action={
            user?.role === 'admin' && (
              <IconButton
                onClick={() => setIsEditing(true)}
                sx={{
                  width: 40,
                  height: 40,
                  color: 'text.secondary',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Iconify icon="solar:pen-bold" width={20} />
              </IconButton>
            )
          }
        />

        <CardContent>
          <Stack spacing={2}>
            {organization ? (
              <>
                <Typography variant="h6" color="primary">
                  {organization.title}
                </Typography>
                <Typography variant="body2">
                  {organization.description}
                </Typography>
                {organization.videoUrl && (
                  <video
                    controls
                    style={{ width: '100%', maxHeight: '300px' }}
                    src={organization.videoUrl}>
                    <track
                      kind="captions"
                      src=""
                      label="English captions"
                      srcLang="en"
                      default
                    />
                    Your browser does not support the video tag.
                  </video>
                )}
              </>
            ) : (
              <Typography variant="body2" color="text.secondary" align="center">
                No organization information available
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Dialog open={isEditing} onClose={() => setIsEditing(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Organization Information</DialogTitle>
        <DialogContent>
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
          >
            <Stack spacing={3} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Title"
                {...register('title', {
                  required: 'Title is required',
                  minLength: {
                    value: 3,
                    message: 'Title must be at least 3 characters'
                  },
                  maxLength: {
                    value: 100,
                    message: 'Title must not exceed 100 characters'
                  }
                })}
                error={!!errors.title}
                helperText={errors.title?.message}
              />
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                {...register('description', {
                  required: 'Description is required',
                  minLength: {
                    value: 10,
                    message: 'Description must be at least 10 characters'
                  },
                  maxLength: {
                    value: 500,
                    message: 'Description must not exceed 500 characters'
                  }
                })}
                error={!!errors.description}
                helperText={errors.description?.message}
              />
              <Button
                variant="outlined"
                component="label"
                startIcon={<Iconify icon="material-symbols:upload" />}
              >
                Upload Video
                <input
                  type="file"
                  accept="video/*"
                  hidden
                  onChange={handleFileChange}
                />
              </Button>
              {selectedFile && (
                <Typography variant="body2" color="primary">
                  Selected file: {selectedFile.name}
                </Typography>
              )}
            </Stack>
            <DialogActions>
              <Button onClick={() => setIsEditing(false)} color="inherit">
                Cancel
              </Button>
              <LoadingButton loading={loading} variant="contained" type="submit">
                Save Changes
              </LoadingButton>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
} 