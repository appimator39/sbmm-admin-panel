import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';

import {
  Box,
  Grid,
  Alert,
  Dialog,
  Button,
  styled,
  TextField,
  IconButton,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

interface LectureFormData {
  title: string;
  description: string;
  order: number;
  duration: string;
  resources: string[];
}

interface AddLectureModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  loading: boolean;
  error: string | null;
  chapterId: string;
  chapterTitle: string;
}

export function AddLectureModal({
  open,
  onClose,
  onSubmit,
  loading,
  error,
  chapterId,
  chapterTitle,
}: AddLectureModalProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LectureFormData>({
    defaultValues: {
      title: '',
      description: '',
      order: 0,
      duration: '',
      resources: [],
    },
  });

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleFormSubmit = async (data: LectureFormData) => {
    setSuccessMessage(null);
    setFileError(null);

    if (!selectedFile) {
      setFileError('Please select a video file');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const createLectureDto = {
        title: data.title,
        description: data.description,
        content: chapterId,
        order: data.order,
        duration: data.duration,
        isPreview: false,
        resources: data.resources,
      };

      // Convert the DTO to a string as required by the backend
      formData.append('createLectureDto', JSON.stringify(createLectureDto));

      await onSubmit(formData);

      if (!error) {
        setSuccessMessage('Lecture added successfully!');
        reset();
        setSelectedFile(null);
      }
    } catch (err) {
      setSuccessMessage(null);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setFileError(null);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        Add New Lecture to {chapterTitle}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Iconify icon="eva:close-fill" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="title"
                control={control}
                rules={{
                  required: 'Title is required',
                  minLength: {
                    value: 3,
                    message: 'Title must be at least 3 characters long',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Title"
                    error={!!errors.title}
                    helperText={errors.title?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                rules={{
                  required: 'Description is required',
                  minLength: {
                    value: 10,
                    message: 'Description must be at least 10 characters long',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Description"
                    multiline
                    rows={4}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={6}>
              <Controller
                name="order"
                control={control}
                rules={{ required: 'Order is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label="Order"
                    error={!!errors.order}
                    helperText={errors.order?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={6}>
              <Controller
                name="duration"
                control={control}
                rules={{ required: 'Duration is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Duration"
                    error={!!errors.duration}
                    helperText={errors.duration?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Video File
                </Typography>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<Iconify icon="material-symbols:upload" />}
                  sx={{ mb: 1 }}
                >
                  Choose Video File
                  <VisuallyHiddenInput type="file" accept="video/*" onChange={handleFileChange} />
                </Button>
                {fileError && (
                  <Typography color="error" variant="caption" display="block">
                    {fileError}
                  </Typography>
                )}
                {selectedFile && (
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Iconify icon="material-symbols:video-file" sx={{ color: 'primary.main' }} />
                    <Typography variant="body2">{selectedFile.name}</Typography>
                    <IconButton
                      size="small"
                      onClick={() => setSelectedFile(null)}
                      sx={{ ml: 'auto' }}
                    >
                      <Iconify icon="eva:close-fill" />
                    </IconButton>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          {!error && successMessage && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {successMessage}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            reset();
            setSelectedFile(null);
            setFileError(null);
          }}
          color="inherit"
        >
          Clear
        </Button>
        <Button
          onClick={handleSubmit(handleFormSubmit)}
          color="primary"
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          Add Lecture
        </Button>
      </DialogActions>
    </Dialog>
  );
}
