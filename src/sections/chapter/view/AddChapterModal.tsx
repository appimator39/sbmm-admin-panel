import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';

import {
  Box,
  Grid,
  Alert,
  Dialog,
  Button,
  TextField,
  IconButton,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Autocomplete,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { useCourses } from 'src/hooks/use-courses';

interface AddChapterModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    order: number;
    course: string;
  }) => Promise<void>;
  loading: boolean;
  error: string | null;
  courseId?: string;
  courseTitle?: string;
}

interface FormData {
  title: string;
  description: string;
  course: string;
}

export function AddChapterModal({
  open,
  onClose,
  onSubmit,
  loading,
  error,
  courseId,
  courseTitle,
}: AddChapterModalProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      title: '',
      description: '',
      course: courseId || '',
    },
  });

  const { courses, loading: coursesLoading } = useCourses(0, 100);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Reset form when courseId changes
  useEffect(() => {
    reset({
      title: '',
      description: '',
      course: courseId || '',
    });
  }, [courseId, reset]);

  const handleFormSubmit = async (data: FormData) => {
    setSuccessMessage(null);
    try {
      await onSubmit({
        ...data,
        order: 1, // Always set order to 1 for new chapters
      });
      if (!error) {
        setSuccessMessage('Chapter added successfully!');
        reset();
      }
    } catch (err) {
      setSuccessMessage(null);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        Add New Chapter {courseTitle ? `to ${courseTitle}` : ''}
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
                name="course"
                control={control}
                rules={{ required: 'Course is required' }}
                render={({ field: { onChange, value } }) => (
                  <Autocomplete
                    options={courses}
                    getOptionLabel={(option) => option.title}
                    loading={coursesLoading}
                    value={courses.find((course) => course._id === value) || null}
                    onChange={(_, newValue) => onChange(newValue ? newValue._id : '')}
                    disabled={!!courseId}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Course"
                        error={!!errors.course}
                        helperText={errors.course?.message}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {coursesLoading ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                )}
              />
            </Grid>

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
          Add Chapter
        </Button>
      </DialogActions>
    </Dialog>
  );
}
