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
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  Alert,
  DialogContentText,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import httpService from 'src/services/httpService';

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  estimatedPrice: number;
  duration: number;
  thumbnail: string;
  instructor: string;
  students: string[];
  reviews: string[];
  category: string[];
  content: string[];
  tags: string[];
  ratings: number;
  language: string;
  isPublished: boolean;
  isFree: boolean;
  totalSales: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface CourseResponse {
  statusCode: number;
  message: string;
  data: Course;
}

interface ViewCoursesModalProps {
  open: boolean;
  onClose: () => void;
  batchId: string;
  batchTitle: string;
  courseIds: string[];
}

export function ViewCoursesModal({ open, onClose, batchId, batchTitle, courseIds }: ViewCoursesModalProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [courseToRemove, setCourseToRemove] = useState<Course | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      if (open && courseIds && courseIds.length > 0) {
        setLoading(true);
        setError(null);
        try {
          const fetchedCourses = await Promise.all(
            courseIds.map(async (id) => {
              if (!id) {
                return null;
              }
              const response = await httpService.get<CourseResponse>(`/courses/${id}`);
              return response.data.data;
            })
          );
          const validCourses = fetchedCourses.filter((course): course is Course => course !== null);
          setCourses(validCourses);
        } catch (err) {
          setError('Failed to fetch courses');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchCourses();
  }, [open, courseIds]);

  const handleRemoveClick = (course: Course) => {
    setCourseToRemove(course);
    setConfirmDialogOpen(true);
  };

  const handleConfirmClose = () => {
    setConfirmDialogOpen(false);
    setCourseToRemove(null);
  };

  const handleRemoveCourse = async () => {
    if (!courseToRemove) return;

    try {
      setRemoveLoading(true);
      await httpService.delete(`/batch/${batchId}/courses/${courseToRemove._id}`);
      setCourses(courses.filter(course => course._id !== courseToRemove._id));
      handleConfirmClose();
    } catch (err) {
      setError('Failed to remove course from batch');
    } finally {
      setRemoveLoading(false);
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
            <Typography variant="h6">
              Courses in {batchTitle}
            </Typography>
            <IconButton onClick={onClose}>
              <Iconify icon="mdi:close" />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : courses.length === 0 ? (
            <Typography color="text.secondary" align="center">
              No courses assigned to this batch
            </Typography>
          ) : (
            <List>
              {courses.map((course) => (
                <ListItem
                  key={course._id}
                  divider
                  sx={{
                    '&:last-child': {
                      borderBottom: 'none',
                    },
                  }}
                >
                  <ListItemText
                    primary={course.title}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {course.description}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Duration: {course.duration} | Price: ${course.price}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleRemoveClick(course)}
                      disabled={removeLoading}
                    >
                      <Iconify icon="mdi:delete" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmDialogOpen}
        onClose={handleConfirmClose}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">
          Remove Course from Batch
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            Are you sure you want to remove &ldquo;{courseToRemove?.title}&rdquo; from this batch?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmClose}>Cancel</Button>
          <Button
            onClick={handleRemoveCourse}
            color="error"
            disabled={removeLoading}
            startIcon={removeLoading && <CircularProgress size={20} />}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 