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
  Stack,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { useUsers } from 'src/hooks/use-users';
import { getRandomString } from 'src/utils/random-string';

interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
  onUsersAdded?: () => void;
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
  rollNo?: string;
}

interface BulkUploadProgress {
  total: number;
  completed: number;
  failed: number;
  currentUser: string;
}

export function AddUserModal({ open, onClose, onUsersAdded }: AddUserModalProps) {
  const { addUser, addUserLoading, addUserError, fetchUsers } = useUsers(0, 25);
  const [isBulkUpload, setIsBulkUpload] = useState(false);
  const [bulkData, setBulkData] = useState<UserFormData[]>([]);
  const [uploadProgress, setUploadProgress] = useState<BulkUploadProgress | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [bulkUploadInProgress, setBulkUploadInProgress] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    defaultValues: {
      name: '',
      email: '',
      fatherName: '',
      gender: 'MALE',
      phoneNumber: '',
      whatsapp: '',
      facebookProfileUrl: '',
      address: '',
      rollNo: '',
    },
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileError(null);
    const reader = new FileReader();

    if (file.name.toLowerCase().endsWith('.csv')) {
      // Handle CSV file
      reader.readAsText(file);
      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const csvData = e.target?.result as string;
          // Split by newlines and filter out empty lines
          const rows = csvData.split('\n').filter(row => row.trim());
          
          // Skip header row if present
          const dataRows = rows[0].includes('"id";"name";"father_name";"email"') ? rows.slice(1) : rows;
          
          // Process each row
          const formattedData = dataRows.map(row => {
            // Split by semicolon and remove quotes
            const fields = row.split(';').map(field => 
              field.replace(/^"|"$/g, '').trim()
            );

            // Ensure CSV format matches Excel format
            return {
              name: fields[1] || "",
              email: fields[3] || "",
              password: getRandomString(10),
              fatherName: fields[2] || "",
              gender: "MALE" as 'MALE', // Default to MALE if not specified
              phoneNumber: fields[6] || "",
              whatsapp: fields[6] || "", // Use phone as whatsapp
              facebookProfileUrl: fields[14] || "",
              address: fields[15] || "",
              rollNo: fields[13] || ""
            };
          });

          if (formattedData.length === 0) {
            setFileError('No valid data found in the CSV file.');
            return;
          }

          setBulkData(formattedData);
          setUploadProgress({
            total: formattedData.length,
            completed: 0,
            failed: 0,
            currentUser: '',
          });
        } catch (err) {
          setFileError('Error processing the CSV file. Please check the file format.');
          console.error('Error processing CSV file:', err);
        }
      };
    } else {
      // Handle Excel file
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
    }
  };

  const onSubmit = async (data: UserFormData) => {
    setSuccessMessage(null);
    try {
      // Generate a random password for single user registration
      const userData = {
        ...data,
        password: getRandomString(10),
      };
      await addUser(userData);
      if (!addUserError) {
        setSuccessMessage('User added successfully!');
        reset();
        onUsersAdded?.(); // Call the callback
        await fetchUsers(0); // Refetch the data
        onClose();
      }
    } catch (err) {
      setSuccessMessage(null);
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkData.length) return;
    setBulkUploadInProgress(true);

    try {
      setUploadProgress({
        total: bulkData.length,
        completed: 0,
        failed: 0,
        currentUser: bulkData[0].name,
      });

      // Process users one by one - we want sequential processing here
      // eslint-disable-next-line no-await-in-loop
      for (let i = 0; i < bulkData.length; i += 1) {
        const user = bulkData[i];
        const nextUser = i + 1 < bulkData.length ? bulkData[i + 1].name : '';
        
        // Update current user being processed
        setUploadProgress((prev) => prev && {
          ...prev,
          currentUser: user.name,
        });

        try {
          // Sequential processing is intentional here to avoid overwhelming the server
          // eslint-disable-next-line no-await-in-loop
          await addUser(user);
          // Update progress after successful registration
          setUploadProgress((prev) => prev && {
            ...prev,
            completed: prev.completed + 1,
            currentUser: nextUser,
          });
        } catch (err) {
          console.error(`Failed to add user ${user.name}:`, err);
          // Update progress after failed registration and move to next user
          setUploadProgress((prev) => prev && {
            ...prev,
            failed: prev.failed + 1,
            currentUser: nextUser,
          });
        }
      }

      // Get final progress state to determine success/failure
      const finalProgress = await new Promise<BulkUploadProgress | null>((resolve) => {
        setUploadProgress((prev) => {
          resolve(prev);
          return prev;
        });
      });

      if (finalProgress) {
        if (finalProgress.failed === 0) {
          setSuccessMessage(`Successfully registered ${finalProgress.completed} users!`);
          setBulkData([]);
          setIsBulkUpload(false);
          onUsersAdded?.(); // Call the callback
          await fetchUsers(0); // Refetch the data
          if (onClose) onClose();
        } else {
          setSuccessMessage(`Registration completed with ${finalProgress.failed} failures out of ${bulkData.length} users.`);
        }
      }
    } finally {
      setBulkUploadInProgress(false);
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
              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
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

                <input
                  accept=".csv"
                  style={{ display: 'none' }}
                  id="csv-file-upload"
                  type="file"
                  onChange={handleFileUpload}
                />
                <Button
                  component="label"
                  htmlFor="csv-file-upload"
                  variant="outlined"
                  startIcon={<Iconify icon="mdi:file-delimited" />}
                >
                  Upload CSV File
                </Button>
              </Stack>

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
          disabled={isBulkUpload ? (!bulkData.length || bulkUploadInProgress) : addUserLoading}
          startIcon={
            (isBulkUpload ? bulkUploadInProgress : addUserLoading) ? (
              <CircularProgress size={20} sx={{ color: 'common.white' }} />
            ) : null
          }
        >
          {isBulkUpload 
            ? bulkUploadInProgress 
              ? `Processing (${uploadProgress?.completed || 0}/${bulkData.length})...` 
              : 'Register All Users' 
            : addUserLoading 
              ? 'Registering...' 
              : 'Register'
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
}

