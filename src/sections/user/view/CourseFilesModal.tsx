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
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { useCourseFiles } from 'src/hooks/use-course-files';

interface CourseFilesModalProps {
  open: boolean;
  onClose: () => void;
  courseId: string;
}

export function CourseFilesModal({ open, onClose, courseId }: CourseFilesModalProps) {
  const { files, loading, error, fetchCourseFiles } = useCourseFiles(0, 25);

  useEffect(() => {
    if (open) {
      fetchCourseFiles(courseId);
    }
  }, [open, courseId, fetchCourseFiles]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            Course Files
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
        ) : files.length === 0 ? (
          <Typography color="text.secondary" align="center">
            No files available
          </Typography>
        ) : (
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
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
} 