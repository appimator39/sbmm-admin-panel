import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as XLSX from 'xlsx';

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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
  LinearProgress,
  Typography,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { useUsers } from 'src/hooks/use-users';

interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
}

interface UserFormData {
  name: string;
  email: string;
  password: string;
  fatherName: string;
  gender: 'MALE' | 'FEMALE';
  phoneNumber: string;
  whatsapp: string;
  facebookProfileUrl: string;
  address: string;
}

interface BulkUploadProgress {
  total: number;
  completed: number;
  failed: number;
  currentUser: string;
}

export function AddUserModal({ open, onClose }: AddUserModalProps) {
  const { addUser, addUserLoading, addUserError } = useUsers(0, 25);
  const [isBulkUpload, setIsBulkUpload] = useState(false);
  const [bulkData, setBulkData] = useState<UserFormData[]>([]);
  const [uploadProgress, setUploadProgress] = useState<BulkUploadProgress | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormData>();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileError(null);
    const reader = new FileReader();
    reader.readAsBinaryString(file);

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(sheet);

        const formattedData = parsedData.map((row: any) => ({
          name: row["Full Name"]
            ? row["Full Name"]
                .toLowerCase()
                .split(' ')
                .map((word: string) => {
                  if (!word) return '';
                  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                })
                .filter(Boolean)
                .join(' ')
                .trim()
            : "",
          email: row["Personal Email"] || "",
          password: "Password@123", // Default password
          fatherName: `${row["Father Name: First"] || ""} ${row["Father Name: Last"] || ""}`
            .toLowerCase()
            .split(' ')
            .map((word: string) => {
              if (!word) return '';
              return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .filter(Boolean)
            .join(' ')
            .trim(),
          gender: row.Gender?.toUpperCase() || "",
          phoneNumber: row["Phone / WhatsApp"] || "",
          whatsapp: row["Phone / WhatsApp"] || "",
          facebookProfileUrl: row["Real Facebook URL"] || "",
          address: `${row["Address: Address Line 1"] || ""}, ${row["Address: City"] || ""}, ${row["Address: State"] || ""}, ${row["Address: Country"] || ""}`.replace(/, ,/g, ',').trim()
        }));

        setBulkData(formattedData);
        setUploadProgress({
          total: formattedData.length,
          completed: 0,
          failed: 0,
          currentUser: '',
        });
      } catch (error) {
        setFileError('Error processing the Excel file. Please check the file format.');
        console.error('Error processing Excel file:', error);
      }
    };
  };

  const onSubmit = async (data: UserFormData) => {
    setSuccessMessage(null);
    try {
      await addUser(data);
      if (!addUserError) {
        setSuccessMessage('User added successfully!');
        reset();
        onClose();
      }
    } catch (err) {
      setSuccessMessage(null);
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkData.length) return;

    setUploadProgress({
      total: bulkData.length,
      completed: 0,
      failed: 0,
      currentUser: bulkData[0].name,
    });

    // Process all users in parallel with a limit of 5 concurrent requests
    const batchSize = 5;
    const batches = [];
    
    for (let index = 0; index < bulkData.length; index += batchSize) {
      const batch = bulkData.slice(index, index + batchSize);
      const batchPromises = batch.map(async (user, batchIndex) => {
        try {
          await addUser(user);
          setUploadProgress(prev => prev ? {
            ...prev,
            completed: prev.completed + 1,
            currentUser: bulkData[index + batchIndex + 1]?.name || '',
          } : null);
        } catch (err) {
          setUploadProgress(prev => prev ? {
            ...prev,
            failed: prev.failed + 1,
            currentUser: bulkData[index + batchIndex + 1]?.name || '',
          } : null);
        }
      });
      batches.push(...batchPromises);
    }

    await Promise.all(batches);

    if (uploadProgress?.failed === 0) {
      setSuccessMessage(`Successfully registered ${uploadProgress.completed} users!`);
      setBulkData([]);
      setIsBulkUpload(false);
      onClose();
    } else {
      setSuccessMessage(`Registration completed with ${uploadProgress?.failed} failures.`);
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
        <Box sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isBulkUpload}
                onChange={(e) => {
                  setIsBulkUpload(e.target.checked);
                  setBulkData([]);
                  setUploadProgress(null);
                  setFileError(null);
                }}
              />
            }
            label="Bulk Upload Users"
          />

          {isBulkUpload ? (
            <Box sx={{ mt: 2 }}>
              <input
                accept=".xlsx,.xls"
                style={{ display: 'none' }}
                id="excel-file-upload"
                type="file"
                onChange={handleFileUpload}
              />
              <Button
                component="label"
                htmlFor="excel-file-upload"
                variant="outlined"
                startIcon={<Iconify icon="mdi:file-excel" />}
              >
                Upload Excel File
              </Button>

              {fileError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {fileError}
                </Alert>
              )}

              {bulkData.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Found {bulkData.length} users to register
                  </Typography>
                </Box>
              )}

              {uploadProgress && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Processing: {uploadProgress.currentUser}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(uploadProgress.completed / uploadProgress.total) * 100}
                    sx={{ mt: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Progress: {uploadProgress.completed}/{uploadProgress.total} users
                    {uploadProgress.failed > 0 && ` (${uploadProgress.failed} failed)`}
                  </Typography>
                </Box>
              )}
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <TextField
                fullWidth
                label="Full Name"
                margin="normal"
                {...register('name', { required: 'Full Name is required' })}
                error={!!errors.name}
                helperText={errors.name?.message}
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

              <TextField
                fullWidth
                label="Password"
                type="password"
                margin="normal"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
                  },
                })}
                error={!!errors.password}
                helperText={errors.password?.message}
              />

              <TextField
                fullWidth
                label="Father's Name"
                margin="normal"
                {...register('fatherName', { required: "Father's Name is required" })}
                error={!!errors.fatherName}
                helperText={errors.fatherName?.message}
              />

              <FormControl fullWidth margin="normal">
                <InputLabel>Gender</InputLabel>
                <Select
                  label="Gender"
                  {...register('gender', { required: 'Gender is required' })}
                  error={!!errors.gender}
                >
                  <MenuItem value="MALE">Male</MenuItem>
                  <MenuItem value="FEMALE">Female</MenuItem>
                </Select>
                {errors.gender && (
                  <Box component="span" sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                    {errors.gender.message}
                  </Box>
                )}
              </FormControl>

              <TextField
                fullWidth
                label="Phone Number"
                margin="normal"
                {...register('phoneNumber', {
                  required: 'Phone Number is required',
                  pattern: {
                    value: /^(\+?92|0)?[0-9]{10}$/,
                    message: 'Please enter a valid phone number (e.g., +923063624278 or 03063624278)',
                  },
                })}
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber?.message}
              />

              <TextField
                fullWidth
                label="WhatsApp Number"
                margin="normal"
                {...register('whatsapp', {
                  required: 'WhatsApp Number is required',
                  pattern: {
                    value: /^(\+?92|0)?[0-9]{10}$/,
                    message: 'Please enter a valid WhatsApp number (e.g., +923063624278 or 03063624278)',
                  },
                })}
                error={!!errors.whatsapp}
                helperText={errors.whatsapp?.message}
              />

              <TextField
                fullWidth
                label="Facebook Profile URL"
                margin="normal"
                {...register('facebookProfileUrl', {
                  required: 'Facebook Profile URL is required',
                  pattern: {
                    value: /^(https?:\/\/)?(www\.)?facebook\.com\/[a-zA-Z0-9(.)?]/,
                    message: 'Please enter a valid Facebook profile URL',
                  },
                })}
                error={!!errors.facebookProfileUrl}
                helperText={errors.facebookProfileUrl?.message}
              />

              <TextField
                fullWidth
                label="Address"
                margin="normal"
                multiline
                rows={3}
                {...register('address', { required: 'Address is required' })}
                error={!!errors.address}
                helperText={errors.address?.message}
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
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => reset()} color="secondary">
          Clear
        </Button>
        <Button
          onClick={isBulkUpload ? handleBulkUpload : handleSubmit(onSubmit)}
          color="primary"
          variant="contained"
          disabled={isBulkUpload ? !bulkData.length : addUserLoading}
          startIcon={addUserLoading && <CircularProgress size={20} />}
        >
          {isBulkUpload ? 'Register All Users' : 'Register'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
