import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import Snackbar from '@mui/material/Snackbar';

import { Iconify } from 'src/components/iconify';
import httpService from 'src/services/httpService';
import { useUsers } from 'src/hooks/use-users';
import { useBatches } from 'src/hooks/use-batches';
import { UrgentNotificationFormData, User, Batch } from '../types';

// ----------------------------------------------------------------------

interface AddUrgentNotificationModalProps {
  open: boolean;
  onClose: VoidFunction;
  onNotificationAdded: VoidFunction;
}

interface FormErrors {
  title?: string;
  description?: string;
  type?: string;
  recipients?: string;
}

interface SearchUserResponse {
  statusCode: number;
  message: string;
  data: {
    _id: string;
    name: string;
    email: string;
    rollNo: string;
    [key: string]: any;
  }[];
}

const notificationTypes = [
  { value: 'HEADLINE', label: 'Headline', color: 'primary' as const, icon: 'solar:star-bold' },
  { value: 'INFO', label: 'Info', color: 'info' as const, icon: 'solar:info-circle-bold' },
  { value: 'WARNING', label: 'Warning', color: 'warning' as const, icon: 'solar:danger-triangle-bold' },
  { value: 'ERROR', label: 'Error', color: 'error' as const, icon: 'solar:close-circle-bold' },
];

export function AddUrgentNotificationModal({ open, onClose, onNotificationAdded }: AddUrgentNotificationModalProps) {
  const [formData, setFormData] = useState<UrgentNotificationFormData>({
    title: '',
    description: '',
    type: 'HEADLINE',
    userIds: [],
    batchIds: [],
    isDefault: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });
  
  // User search state
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userSearchResults, setUserSearchResults] = useState<User[]>([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  
  // Batch selection state
  const [selectedBatches, setSelectedBatches] = useState<Batch[]>([]);
  
  const { searchUsers } = useUsers(0, 25);
  const { batches, loading: batchesLoading } = useBatches(0, 100);

  const searchUsersDebounced = useCallback(async (query: string) => {
    if (query.length < 2) {
      setUserSearchResults([]);
      return;
    }

    setUserSearchLoading(true);
    try {
      const response = await httpService.get<SearchUserResponse>(`/users/admin/find-student?email=${encodeURIComponent(query)}`);
      const searchResults = response.data.data;
      
      setUserSearchResults(searchResults.map((user: any) => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        rollNo: user.rollNo,
      })));
    } catch (error) {
      console.error('Error searching users:', error);
      setUserSearchResults([]);
    } finally {
      setUserSearchLoading(false);
    }
  }, []);

  const handleUserSearch = (query: string) => {
    setUserSearchQuery(query);
    searchUsersDebounced(query);
  };

  const handleUserSelect = (user: User) => {
    if (!selectedUsers.find(u => u._id === user._id)) {
      const newSelectedUsers = [...selectedUsers, user];
      setSelectedUsers(newSelectedUsers);
      setFormData(prev => ({ 
        ...prev, 
        userIds: newSelectedUsers.map(u => u._id) 
      }));
    }
    setUserSearchQuery('');
    setUserSearchResults([]);
  };

  const handleUserRemove = (userId: string) => {
    const newSelectedUsers = selectedUsers.filter(u => u._id !== userId);
    setSelectedUsers(newSelectedUsers);
    setFormData(prev => ({ 
      ...prev, 
      userIds: newSelectedUsers.map(u => u._id) 
    }));
  };

  const handleBatchSelect = (selectedBatchList: Batch[]) => {
    setSelectedBatches(selectedBatchList);
    setFormData(prev => ({ 
      ...prev, 
      batchIds: selectedBatchList.map(b => b._id) 
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.type) {
      newErrors.type = 'Notification type is required';
    }

    if (formData.userIds.length === 0 && formData.batchIds.length === 0) {
      newErrors.recipients = 'Please select at least one user or batch';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setSubmitError('');
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await httpService.post('/notifications', {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        userIds: formData.userIds,
        batchIds: formData.batchIds,
        isDefault: false,
      });

      setSnackbar({
        open: true,
        message: 'Notification created successfully!',
        severity: 'success',
      });

      onNotificationAdded();
      handleClose();
    } catch (error: any) {
      setSubmitError(error.response?.data?.message || 'Failed to create notification');
      console.error('Error creating notification:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      type: 'HEADLINE',
      userIds: [],
      batchIds: [],
      isDefault: false,
    });
    setSelectedUsers([]);
    setSelectedBatches([]);
    setUserSearchQuery('');
    setUserSearchResults([]);
    setErrors({});
    setSubmitError('');
    onClose();
  };

  const handleInputChange = (field: keyof UrgentNotificationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={handleClose}>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Iconify icon="solar:notification-unread-bold" width={24} />
          Create New Notification
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            error={!!errors.title}
            helperText={errors.title}
            placeholder="Enter notification title..."
          />

          <TextField
            fullWidth
            label="Description"
            multiline
            rows={4}
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            error={!!errors.description}
            helperText={errors.description}
            placeholder="Enter notification description..."
          />

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
              Notification Type
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {notificationTypes.map((type) => (
                <Chip
                  key={type.value}
                  label={type.label}
                  color={formData.type === type.value ? type.color : 'default'}
                  variant={formData.type === type.value ? 'filled' : 'outlined'}
                  icon={<Iconify icon={type.icon} width={16} />}
                  onClick={() => handleInputChange('type', type.value)}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: formData.type === type.value ? undefined : 'action.hover',
                    },
                  }}
                />
              ))}
            </Stack>
            {errors.type && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                {errors.type}
              </Typography>
            )}
          </Box>

          {/* User Selection */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
              Select Users
            </Typography>
            <TextField
              fullWidth
              placeholder="Search users by email..."
              value={userSearchQuery}
              onChange={(e) => handleUserSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
                endAdornment: userSearchLoading && (
                  <InputAdornment position="end">
                    <CircularProgress size={20} />
                  </InputAdornment>
                ),
              }}
            />
            
            {/* User search results */}
            {userSearchResults.length > 0 && (
              <Box sx={{ mt: 1, maxHeight: 200, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                {userSearchResults.map((user) => (
                  <Box
                    key={user._id}
                    onClick={() => handleUserSelect(user)}
                    sx={{
                      p: 1.5,
                      cursor: 'pointer',
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:hover': { bgcolor: 'action.hover' },
                      '&:last-child': { borderBottom: 'none' },
                    }}
                  >
                    <Typography variant="body2" fontWeight={500}>
                      {user.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}

            {/* Selected users */}
            {selectedUsers.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Selected Users ({selectedUsers.length})
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {selectedUsers.map((user) => (
                    <Chip
                      key={user._id}
                      label={`${user.name} (${user.email})`}
                      onDelete={() => handleUserRemove(user._id)}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Stack>
              </Box>
            )}
          </Box>

          {/* Batch Selection */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
              Select Batches
            </Typography>
            <Autocomplete
              multiple
              options={batches.map(batch => ({ _id: batch._id, title: batch.title, description: batch.description }))}
              getOptionLabel={(option) => option.title}
              value={selectedBatches}
              onChange={(_, newValue) => handleBatchSelect(newValue)}
              loading={batchesLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Select batches..."
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {batchesLoading ? <CircularProgress size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={option.title}
                    size="small"
                    {...getTagProps({ index })}
                  />
                ))
              }
            />
          </Box>

          {errors.recipients && (
            <Alert severity="error">
              {errors.recipients}
            </Alert>
          )}

          <Box
            sx={{
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              bgcolor: 'background.neutral',
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Preview
            </Typography>
            <Alert 
              severity={formData.type === 'HEADLINE' ? 'info' : formData.type.toLowerCase() as any}
              icon={
                <Iconify 
                  icon={notificationTypes.find(t => t.value === formData.type)?.icon || 'solar:info-circle-bold'} 
                  width={20} 
                />
              }
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {formData.title || 'Notification Title'}
              </Typography>
              <Typography variant="body2">
                {formData.description || 'Notification description will appear here...'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Recipients: {selectedUsers.length} users, {selectedBatches.length} batches
              </Typography>
            </Alert>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" color="inherit" onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>

        <Button 
          variant="contained" 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          startIcon={isSubmitting ? undefined : <Iconify icon="solar:notification-unread-bold" />}
        >
          {isSubmitting ? 'Creating...' : 'Create Notification'}
        </Button>
      </DialogActions>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
} 