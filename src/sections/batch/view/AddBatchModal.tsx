import { useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  Box,
  Alert,
  Dialog,
  Button,
  TextField,
  IconButton,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';

interface AddBatchModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description: string }) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function AddBatchModal({ open, onClose, onSubmit, loading, error }: AddBatchModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ title: string; description: string }>();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFormSubmit = async (data: { title: string; description: string }) => {
    setSuccessMessage(null);
    try {
      await onSubmit(data);
      if (!error) {
        setSuccessMessage('Batch added successfully!');
        reset();
      }
    } catch (err) {
      setSuccessMessage(null);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Add New Batch
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
        <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
          <TextField
            fullWidth
            label="Title"
            margin="normal"
            {...register('title', {
              required: 'Title is required',
              minLength: {
                value: 2,
                message: 'Title must be at least 2 characters long',
              },
            })}
            error={!!errors.title}
            helperText={errors.title?.message}
          />
          <TextField
            fullWidth
            label="Description"
            margin="normal"
            multiline
            rows={4}
            {...register('description', {
              required: 'Description is required',
              minLength: {
                value: 2,
                message: 'Description must be at least 2 characters long',
              },
            })}
            error={!!errors.description}
            helperText={errors.description?.message}
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
        <Button onClick={() => reset()} color="secondary">
          Clear
        </Button>
        <Button
          onClick={handleSubmit(handleFormSubmit)}
          color="primary"
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          Add Batch
        </Button>
      </DialogActions>
    </Dialog>
  );
}
