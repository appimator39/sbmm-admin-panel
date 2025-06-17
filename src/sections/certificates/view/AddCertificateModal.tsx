import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
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
import { useCourses } from 'src/hooks/use-courses';
import { useBatches } from 'src/hooks/use-batches';
import { CertificateFormData, Course, Batch, User } from '../types';

// ----------------------------------------------------------------------

interface AddCertificateModalProps {
  open: boolean;
  onClose: VoidFunction;
  onCertificateAdded: VoidFunction;
}

interface FormErrors {
  courseId?: string;
  certificateType?: string;
  batchId?: string;
  recipientId?: string;
  issueDate?: string;
  description?: string;
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

const certificateTypes = [
  { value: 'user', label: 'Individual User Certificate', color: 'primary' as const, icon: 'solar:user-bold' },
  { value: 'batch', label: 'Batch Certificate', color: 'secondary' as const, icon: 'solar:users-group-two-rounded-bold' },
];

export function AddCertificateModal({ open, onClose, onCertificateAdded }: AddCertificateModalProps) {
  const [formData, setFormData] = useState({
    courseId: '',
    certificateType: 'user' as 'user' | 'batch',
    batchId: '',
    recipientId: '', // For user-based certificates
    issueDate: new Date().toISOString().split('T')[0],
    description: '',
    excludeUsers: [] as string[], // For batch-based certificates
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
  const [excludedUsers, setExcludedUsers] = useState<User[]>([]);
  
  // Selected entities
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [selectedRecipient, setSelectedRecipient] = useState<User | null>(null);
  
  const { courses, loading: coursesLoading } = useCourses(0, 100);
  const { batches, loading: batchesLoading } = useBatches(0, 100);

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

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

  const handleRecipientSelect = (user: User) => {
    setSelectedRecipient(user);
    setFormData(prev => ({ ...prev, recipientId: user._id }));
    setUserSearchQuery('');
    setUserSearchResults([]);
  };

  const handleExcludeUserSelect = (user: User) => {
    if (!excludedUsers.find(u => u._id === user._id)) {
      const newExcludedUsers = [...excludedUsers, user];
      setExcludedUsers(newExcludedUsers);
      setFormData(prev => ({ 
        ...prev, 
        excludeUsers: newExcludedUsers.map(u => u._id) 
      }));
    }
    setUserSearchQuery('');
    setUserSearchResults([]);
  };

  const handleUserRemove = (userId: string) => {
    const newExcludedUsers = excludedUsers.filter(u => u._id !== userId);
    setExcludedUsers(newExcludedUsers);
    setFormData(prev => ({ 
      ...prev, 
      excludeUsers: newExcludedUsers.map(u => u._id) 
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.courseId) {
      newErrors.courseId = 'Course is required';
    }

    if (!formData.certificateType) {
      newErrors.certificateType = 'Certificate type is required';
    }

    if (!formData.batchId) {
      newErrors.batchId = 'Batch is required';
    }

    if (formData.certificateType === 'user' && !formData.recipientId) {
      newErrors.recipientId = 'Recipient is required for individual certificates';
    }

    if (!formData.issueDate) {
      newErrors.issueDate = 'Issue date is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
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
      if (formData.certificateType === 'user') {
        // User-based certificate
        await httpService.post('/certificates/issue-to-user', {
          courseId: formData.courseId,
          recipientId: formData.recipientId,
          batchId: formData.batchId,
          issueDate: new Date(formData.issueDate).toISOString(),
          description: formData.description,
          metadata: {
            grade: "A+",
            completionPercentage: 95,
            courseHours: 40
          }
        });
      } else {
        // Batch-based certificate
        await httpService.post('/certificates/issue-to-batch', {
          courseId: formData.courseId,
          batchId: formData.batchId,
          excludeUsers: formData.excludeUsers,
          issueDate: new Date(formData.issueDate).toISOString(),
          description: formData.description,
          metadata: {
            batchRank: "Top 10%",
            totalModules: 8
          }
        });
      }

      setSnackbar({
        open: true,
        message: 'Certificate created successfully!',
        severity: 'success',
      });

      onCertificateAdded();
      handleClose();
    } catch (error: any) {
      setSubmitError(error.response?.data?.message || 'Failed to create certificate');
      console.error('Error creating certificate:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      courseId: '',
      certificateType: 'user',
      batchId: '',
      recipientId: '',
      issueDate: new Date().toISOString().split('T')[0],
      description: '',
      excludeUsers: [],
    });
    setSelectedCourse(null);
    setSelectedBatch(null);
    setSelectedRecipient(null);
    setExcludedUsers([]);
    setUserSearchQuery('');
    setUserSearchResults([]);
    setErrors({});
    setSubmitError('');
    onClose();
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCourseSelect = (course: Course | null) => {
    setSelectedCourse(course);
    setFormData(prev => ({ ...prev, courseId: course?._id || '' }));
  };

  const handleBatchSelect = (batch: Batch | null) => {
    setSelectedBatch(batch);
    setFormData(prev => ({ ...prev, batchId: batch?._id || '' }));
  };

  const handleCertificateTypeChange = (newType: 'user' | 'batch') => {
    setFormData(prev => ({ ...prev, certificateType: newType }));
    // Clear recipient when switching to batch mode
    if (newType === 'batch') {
      setSelectedRecipient(null);
      setFormData(prev => ({ ...prev, recipientId: '' }));
    }
    // Clear excluded users when switching to user mode
    if (newType === 'user') {
      setExcludedUsers([]);
      setFormData(prev => ({ ...prev, excludeUsers: [] }));
    }
  };

  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={handleClose}>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Iconify icon="solar:diploma-bold" width={24} />
          Create New Certificate
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}

          {/* Certificate Type */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
              Certificate Type
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {certificateTypes.map((type) => (
                <Chip
                  key={type.value}
                  label={type.label}
                  color={formData.certificateType === type.value ? type.color : 'default'}
                  variant={formData.certificateType === type.value ? 'filled' : 'outlined'}
                  icon={<Iconify icon={type.icon} width={16} />}
                  onClick={() => handleCertificateTypeChange(type.value as 'user' | 'batch')}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: formData.certificateType === type.value ? undefined : 'action.hover',
                    },
                  }}
                />
              ))}
            </Stack>
            {errors.certificateType && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                {errors.certificateType}
              </Typography>
            )}
          </Box>

          {/* Course Selection */}
          <Autocomplete
            options={courses.map(course => ({ _id: course._id, title: course.title, description: course.description }))}
            getOptionLabel={(option) => option.title}
            value={selectedCourse}
            onChange={(_, newValue) => handleCourseSelect(newValue)}
            loading={coursesLoading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Course"
                error={!!errors.courseId}
                helperText={errors.courseId}
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

          {/* Batch Selection */}
          <Autocomplete
            options={batches.map(batch => ({ _id: batch._id, title: batch.title, description: batch.description }))}
            getOptionLabel={(option) => option.title}
            value={selectedBatch}
            onChange={(_, newValue) => handleBatchSelect(newValue)}
            loading={batchesLoading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Batch"
                error={!!errors.batchId}
                helperText={errors.batchId}
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
          />

          {/* Recipient Selection (only for user certificates) */}
          {formData.certificateType === 'user' && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                Select Recipient
              </Typography>
              <TextField
                fullWidth
                placeholder="Search user by email..."
                value={userSearchQuery}
                onChange={(e) => handleUserSearch(e.target.value)}
                error={!!errors.recipientId}
                helperText={errors.recipientId}
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
                      onClick={() => handleRecipientSelect(user)}
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

              {/* Selected recipient */}
              {selectedRecipient && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    Selected Recipient
                  </Typography>
                  <Chip
                    label={`${selectedRecipient.name} (${selectedRecipient.email})`}
                    onDelete={() => {
                      setSelectedRecipient(null);
                      setFormData(prev => ({ ...prev, recipientId: '' }));
                    }}
                    variant="outlined"
                    color="primary"
                  />
                </Box>
              )}
            </Box>
          )}

          {/* Excluded Users (only for batch certificates) */}
          {formData.certificateType === 'batch' && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                Exclude Users (Optional)
              </Typography>
              <TextField
                fullWidth
                placeholder="Search users to exclude by email..."
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
                      onClick={() => handleExcludeUserSelect(user)}
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

              {/* Excluded users */}
              {excludedUsers.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    Excluded Users ({excludedUsers.length})
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {excludedUsers.map((user) => (
                      <Chip
                        key={user._id}
                        label={`${user.name} (${user.email})`}
                        onDelete={() => handleUserRemove(user._id)}
                        size="small"
                        variant="outlined"
                        color="error"
                      />
                    ))}
                  </Stack>
                </Box>
              )}
            </Box>
          )}

          {/* Issue Date */}
          <TextField
            type="date"
            label="Issue Date"
            value={formData.issueDate}
            onChange={(e) => handleInputChange('issueDate', e.target.value)}
            error={!!errors.issueDate}
            helperText={errors.issueDate}
            InputLabelProps={{ shrink: true }}
          />

          {/* Description */}
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            error={!!errors.description}
            helperText={errors.description}
            placeholder="Enter certificate description..."
          />

          {/* Preview */}
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
              severity="info"
              icon={<Iconify icon="solar:diploma-bold" width={20} />}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {formData.certificateType === 'user' ? 'Individual Certificate' : 'Batch Certificate'}
              </Typography>
              <Typography variant="body2">
                {formData.description || 'Certificate description will appear here...'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Course: {selectedCourse?.title || 'Not selected'} | 
                Batch: {selectedBatch?.title || 'Not selected'}
                {formData.certificateType === 'user' && selectedRecipient && (
                  <> | Recipient: {selectedRecipient.name}</>
                )}
                {formData.certificateType === 'batch' && (
                  <> | Excluded: {excludedUsers.length} users</>
                )}
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
          startIcon={isSubmitting ? undefined : <Iconify icon="solar:diploma-bold" />}
        >
          {isSubmitting ? 'Creating...' : 'Create Certificate'}
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