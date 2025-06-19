import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import httpService from 'src/services/httpService';

interface BulkHardwareResetModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ResetOptions {
  resetWindows: boolean;
  resetAndroid: boolean;
  resetMac: boolean;
  resetIOS: boolean;
}

const osOptions = [
  { key: 'resetWindows' as keyof ResetOptions, label: 'Windows', icon: 'logos:microsoft-windows' },
  { key: 'resetAndroid' as keyof ResetOptions, label: 'Android', icon: 'logos:android-icon' },
  { key: 'resetMac' as keyof ResetOptions, label: 'macOS', icon: 'logos:apple' },
  { key: 'resetIOS' as keyof ResetOptions, label: 'iOS', icon: 'logos:apple' },
];

export function BulkHardwareResetModal({ open, onClose, onSuccess }: BulkHardwareResetModalProps) {
  const [resetOptions, setResetOptions] = useState<ResetOptions>({
    resetWindows: false,
    resetAndroid: false,
    resetMac: false,
    resetIOS: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOptionChange = (option: keyof ResetOptions) => {
    setResetOptions(prev => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  const handleSelectAll = () => {
    const allSelected = Object.values(resetOptions).every(Boolean);
    const newValue = !allSelected;
    setResetOptions({
      resetWindows: newValue,
      resetAndroid: newValue,
      resetMac: newValue,
      resetIOS: newValue,
    });
  };

  const handleReset = async () => {
    const selectedOptions = Object.values(resetOptions).some(Boolean);
    if (!selectedOptions) {
      setError('Please select at least one operating system to reset.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await httpService.patch('/users/admin/bulk-reset-hardware-ids', resetOptions);
      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset hardware IDs');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setResetOptions({
      resetWindows: false,
      resetAndroid: false,
      resetMac: false,
      resetIOS: false,
    });
    setError(null);
    onClose();
  };

  const selectedCount = Object.values(resetOptions).filter(Boolean).length;
  const allSelected = selectedCount === osOptions.length;
  const someSelected = selectedCount > 0 && selectedCount < osOptions.length;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Iconify icon="solar:settings-bold" width={24} />
          Bulk Hardware IDs Reset
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ py: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Select the operating systems for which you want to reset hardware IDs for all users.
            This action will clear the stored hardware IDs, allowing users to register new devices.
          </Typography>

          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={handleSelectAll}
                />
              }
              label={
                <Typography variant="subtitle2" fontWeight={600}>
                  Select All Operating Systems
                </Typography>
              }
            />
          </Box>

          <FormGroup>
            {osOptions.map((option) => (
              <FormControlLabel
                key={option.key}
                control={
                  <Checkbox
                    checked={resetOptions[option.key]}
                    onChange={() => handleOptionChange(option.key)}
                    disabled={loading}
                  />
                }
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Iconify icon={option.icon} width={20} />
                    <Typography variant="body2">
                      {option.label}
                    </Typography>
                  </Box>
                }
                sx={{ ml: 2 }}
              />
            ))}
          </FormGroup>

          {selectedCount > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Warning:</strong> This will reset hardware IDs for <strong>{selectedCount}</strong> 
                {selectedCount === 1 ? ' operating system' : ' operating systems'} across all users. 
                This action cannot be undone.
              </Typography>
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button 
          variant="outlined" 
          color="inherit" 
          onClick={handleClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleReset}
          disabled={loading || selectedCount === 0}
          startIcon={loading ? <CircularProgress size={20} /> : <Iconify icon="solar:refresh-bold" />}
        >
          {loading ? 'Resetting...' : `Reset Hardware IDs`}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 