import { useState, useEffect } from 'react';

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
  Typography,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { useCourses } from 'src/hooks/use-courses';
import { useCourseChapters } from 'src/hooks/use-course-chapters';
import httpService from 'src/services/httpService';

interface Course {
  id: string;
  title: string;
}

interface Chapter {
  _id: string;
  title: string;
  description: string;
  order: number;
}

interface AssignLectureModalProps {
  open: boolean;
  onClose: () => void;
  lectureId: string;
  lectureTitle: string;
}

export function AssignLectureModal({
  open,
  onClose,
  lectureId,
  lectureTitle,
}: AssignLectureModalProps) {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [customTitle, setCustomTitle] = useState<string>(lectureTitle);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { courses, loading: coursesLoading } = useCourses(0, 100);
  const { chapters, loading: chaptersLoading } = useCourseChapters(selectedCourse?.id || '');

  // Update customTitle when modal opens or lectureTitle changes
  useEffect(() => {
    if (open) {
      setCustomTitle(lectureTitle);
    }
  }, [open, lectureTitle]);

  const filteredCourses = courses
    .filter((course) => course.title.toLowerCase().includes(inputValue.toLowerCase()))
    .map((course) => ({
      id: course._id,
      title: course.title,
    }));

  const handleSubmit = async () => {
    setError('');
    setSuccessMessage('');

    if (!selectedCourse) {
      setError('Please select a course');
      return;
    }

    if (!selectedChapter) {
      setError('Please select a chapter');
      return;
    }

    if (!orderNumber || Number.isNaN(Number(orderNumber))) {
      setError('Please enter a valid order number');
      return;
    }

    try {
      setLoading(true);

      const requestBody = {
        lectureId,
        targetContentId: selectedChapter._id,
        order: Number(orderNumber),
        customTitle,
      };

      await httpService.post('/lecture/assign-to-content', requestBody);

      setSuccessMessage('Lecture assigned successfully!');
      setSelectedCourse(null);
      setOrderNumber('');
      setCustomTitle(lectureTitle);
      setInputValue('');

      // Close modal after a short delay to show success message
      setTimeout(() => {
        onClose();
        setSuccessMessage(null);
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to assign lecture');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedCourse(null);
    setSelectedChapter(null);
    setOrderNumber('');
    setCustomTitle(lectureTitle);
    setInputValue('');
    setError(null);
    setSuccessMessage(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Assign Lecture to Course
        <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 0.5 }}>
          {lectureTitle}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={handleClose}
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
        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Autocomplete
            fullWidth
            value={selectedCourse}
            onChange={(_, newValue) => {
              setSelectedCourse(newValue);
              setSelectedChapter(null); // Reset chapter when course changes
            }}
            inputValue={inputValue}
            onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
            options={filteredCourses}
            getOptionLabel={(option) => option.title}
            loading={coursesLoading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Course"
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

          <Autocomplete
            fullWidth
            value={selectedChapter}
            onChange={(_, newValue) => setSelectedChapter(newValue)}
            options={chapters}
            getOptionLabel={(option) => option.title}
            loading={chaptersLoading}
            disabled={!selectedCourse}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Chapter"
                placeholder={selectedCourse ? 'Choose a chapter' : 'Select a course first'}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {chaptersLoading ? <CircularProgress size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          <TextField
            fullWidth
            label="Lecture Title"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            placeholder="Enter lecture title"
          />

          <TextField
            fullWidth
            label="Order Number"
            type="number"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="Enter order number (e.g., 1, 2, 3...)"
            inputProps={{ min: 1 }}
          />

          {error && <Alert severity="error">{error}</Alert>}

          {successMessage && <Alert severity="success">{successMessage}</Alert>}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={loading || !selectedCourse || !selectedChapter || !orderNumber}
          startIcon={loading && <CircularProgress size={20} />}
        >
          Assign Lecture
        </Button>
      </DialogActions>
    </Dialog>
  );
}
