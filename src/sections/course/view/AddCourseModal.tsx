import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';

import {
  Box,
  Grid,
  Alert,
  Dialog,
  Button,
  Switch,
  TextField,
  IconButton,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  FormControlLabel,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';

interface AddCourseModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    thumbnail: string;
    category: string[];
    tags: string[];
    isPublished: boolean;
    isFree: boolean;
  }) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function AddCourseModal({ open, onClose, onSubmit, loading, error }: AddCourseModalProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      thumbnail: 'https://www.example.com/thumbnail.png',
      category: ['development', 'javascript'],
      price: 100,
      duration: 100,
      tags: ['tag1', 'tag2'],
      isPublished: false,
      isFree: false,
    },
  });

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFormSubmit = async (data: any) => {
    setSuccessMessage(null);
    try {
      await onSubmit(data);
      if (!error) {
        setSuccessMessage('Course added successfully!');
        reset();
      }
    } catch (err) {
      setSuccessMessage(null);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        Add New Course
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
                name="isPublished"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <FormControlLabel
                    control={<Switch checked={value} onChange={onChange} />}
                    label="Published"
                  />
                )}
              />
            </Grid>

            <Grid item xs={6}>
              <Controller
                name="isFree"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <FormControlLabel
                    control={<Switch checked={value} onChange={onChange} />}
                    label="Free Course"
                  />
                )}
              />
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
        <Button onClick={() => reset()} color="inherit">
          Clear
        </Button>
        <Button
          onClick={handleSubmit(handleFormSubmit)}
          color="primary"
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          Add Course
        </Button>
      </DialogActions>
    </Dialog>
  );
}
