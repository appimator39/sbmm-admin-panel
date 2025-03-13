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
import { useBatches } from 'src/hooks/use-batches';

interface AddBatchModalProps {
  open: boolean;
  onClose: () => void;
  onAddBatch: (data: { title: string; description: string }) => void;
}

export function AddBatchModal({ open, onClose, onAddBatch }: AddBatchModalProps) {
  const { addBatch, addBatchLoading, addBatchError } = useBatches(0, 50); // Adjust page and limit as needed
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ title: string; description: string }>();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const onSubmit = async (data: { title: string; description: string }) => {
    setSuccessMessage(null);
    console.log(data);
    try {
      await addBatch(data);
      if (!addBatchError) {
        setSuccessMessage('Batch added successfully!');
        reset();
        onAddBatch(data); // Call the onAddBatch prop
      }
    } catch (err) {
      setSuccessMessage(null); // Clear success message if there's an error
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
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <TextField
            fullWidth
            label="Title"
            margin="normal"
            {...register('title', { required: 'Title is required' })}
            error={!!errors.title}
            helperText={errors.title?.message}
          />
          <TextField
            fullWidth
            label="Description"
            margin="normal"
            {...register('description', { required: 'Description is required' })}
            error={!!errors.description}
            helperText={errors.description?.message}
          />
          {addBatchError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {addBatchError}
            </Alert>
          )}
          {!addBatchError && successMessage && (
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
          onClick={handleSubmit(onSubmit)}
          color="primary"
          variant="contained"
          disabled={addBatchLoading}
          startIcon={addBatchLoading && <CircularProgress size={20} />}
        >
          Register
        </Button>
      </DialogActions>
    </Dialog>
  );
}
