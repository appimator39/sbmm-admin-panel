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
import { useUsers } from 'src/hooks/use-users';

interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddUserModal({ open, onClose }: AddUserModalProps) {
  const { addUser, addUserLoading, addUserError } = useUsers(0, 25); // Adjust page and limit as needed
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ fullName: string; email: string }>();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const onSubmit = async (data: { fullName: string; email: string }) => {
    setSuccessMessage(null);
    console.log(data);
    try {
      await addUser({ name: data.fullName, email: data.email });
      if (!addUserError) {
        setSuccessMessage('User added successfully!');
        reset();
      }
    } catch (err) {
      setSuccessMessage(null); // Clear success message if there's an error
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Add New User
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
            label="Full Name"
            margin="normal"
            {...register('fullName', { required: 'Full Name is required' })}
            error={!!errors.fullName}
            helperText={errors.fullName?.message}
          />
          <TextField
            fullWidth
            label="Email"
            margin="normal"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: 'Email is invalid',
              },
            })}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          {addUserError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {addUserError}
            </Alert>
          )}
          {!addUserError && successMessage && (
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
          disabled={addUserLoading}
          startIcon={addUserLoading && <CircularProgress size={20} />}
        >
          Register
        </Button>
      </DialogActions>
    </Dialog>
  );
}
