import { useState } from 'react';

import {
  Box,
  Alert,
  Dialog,
  Button,
  TextField,
  IconButton,
  DialogTitle,
  Autocomplete,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { useCourses } from 'src/hooks/use-courses';

interface Course {
  id: string;
  title: string;
}

interface AssignCoursesModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { courseId: string }) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function AssignCoursesModal({
  open,
  onClose,
  onSubmit,
  loading,
  error,
}: AssignCoursesModalProps) {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { courses, loading: coursesLoading } = useCourses(0, 100);

  const filteredCourses = courses
    .filter((course) => course.title.toLowerCase().includes(inputValue.toLowerCase()))
    .map((course) => ({
      id: course._id,
      title: course.title,
    }));

  const handleSubmit = async () => {
    setSuccessMessage(null);
    if (!selectedCourse) return;

    try {
      await onSubmit({ courseId: selectedCourse.id });
      if (!error) {
        setSuccessMessage('Course assigned successfully!');
        setSelectedCourse(null);
      }
    } catch (err) {
      setSuccessMessage(null);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Assign Course
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
        <Box sx={{ mt: 1 }}>
          <Autocomplete
            fullWidth
            value={selectedCourse}
            onChange={(_, newValue) => setSelectedCourse(newValue)}
            inputValue={inputValue}
            onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
            options={filteredCourses}
            getOptionLabel={(option) => option.title}
            loading={coursesLoading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search course"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {coursesLoading ? <CircularProgress size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

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
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={loading || !selectedCourse}
          startIcon={loading && <CircularProgress size={20} />}
        >
          Assign
        </Button>
      </DialogActions>
    </Dialog>
  );
}
