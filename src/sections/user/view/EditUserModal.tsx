import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { Iconify } from 'src/components/iconify';

interface EditUserModalProps {
  open: boolean;
  onClose: () => void;
  user: {
    _id: string;
    name: string;
    fatherName: string;
    gender: string;
    phoneNumber: string;
    whatsapp: string;
    rollNo: string;
    facebookProfileUrl: string;
    address: string;
    email: string;
  } | null;
  onUpdate: (data: any) => Promise<void>;
  loading: boolean;
}

export function EditUserModal({ open, onClose, user, onUpdate, loading }: EditUserModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: 'onChange',
  });

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        fatherName: user.fatherName,
        gender: user.gender,
        phoneNumber: user.phoneNumber,
        whatsapp: user.whatsapp,
        rollNo: user.rollNo,
        facebookProfileUrl: user.facebookProfileUrl,
        address: user.address,
        email: user.email,
      });
    }
  }, [user, reset]);

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const onSubmit = async (data: any) => {
    try {
      await onUpdate(data);
      setSnackbar({
        open: true,
        message: 'User updated successfully',
        severity: 'success',
      });
      onClose();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to update user',
        severity: 'error',
      });
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Edit User
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

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogContent>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Name"
                {...register('name', { required: 'Name is required' })}
                error={!!errors.name}
                helperText={errors.name?.message as string}
              />

              <TextField
                fullWidth
                label="Father Name"
                {...register('fatherName', { required: 'Father name is required' })}
                error={!!errors.fatherName}
                helperText={errors.fatherName?.message as string}
              />

              <TextField
                fullWidth
                select
                label="Gender"
                defaultValue={user?.gender || ''}
                {...register('gender', { required: 'Gender is required' })}
                error={!!errors.gender}
                helperText={errors.gender?.message as string}
              >
                <MenuItem value="MALE">Male</MenuItem>
                <MenuItem value="FEMALE">Female</MenuItem>
              </TextField>

              <TextField
                fullWidth
                label="Phone Number"
                {...register('phoneNumber', {
                  required: 'Phone number is required',
                  pattern: {
                    value: /^\+?[1-9]\d{1,14}$/,
                    message: 'Invalid phone number',
                  },
                })}
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber?.message as string}
              />

              <TextField
                fullWidth
                label="WhatsApp Number"
                {...register('whatsapp', {
                  required: 'WhatsApp number is required',
                  pattern: {
                    value: /^\+?[1-9]\d{1,14}$/,
                    message: 'Invalid WhatsApp number',
                  },
                })}
                error={!!errors.whatsapp}
                helperText={errors.whatsapp?.message as string}
              />

              <TextField
                fullWidth
                label="Roll Number"
                {...register('rollNo', { required: 'Roll number is required' })}
                error={!!errors.rollNo}
                helperText={errors.rollNo?.message as string}
              />

              <TextField
                fullWidth
                label="Facebook Profile URL"
                {...register('facebookProfileUrl', {
                  pattern: {
                    value: /^(https?:\/\/)?(www\.)?facebook\.com\/[a-zA-Z0-9(.)?]/,
                    message: 'Invalid Facebook URL',
                  },
                })}
                error={!!errors.facebookProfileUrl}
                helperText={errors.facebookProfileUrl?.message as string}
              />

              <TextField
                fullWidth
                label="Address"
                multiline
                rows={3}
                {...register('address', { required: 'Address is required' })}
                error={!!errors.address}
                helperText={errors.address?.message as string}
              />

              <TextField
                fullWidth
                label="Email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: 'Invalid email',
                  },
                })}
                error={!!errors.email}
                helperText={errors.email?.message as string}
              />
            </Stack>
          </DialogContent>

          <DialogActions>
            <Button variant="outlined" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting || loading}
              startIcon={isSubmitting || loading ? <CircularProgress size={20} /> : null}
            >
              Update
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
} 