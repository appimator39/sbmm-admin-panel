import { useState } from 'react';

import {
  Box,
  Alert,
  Dialog,
  Button,
  Checkbox,
  TextField,
  IconButton,
  DialogTitle,
  Autocomplete,
  DialogContent,
  DialogActions,
  CircularProgress,
  FormControlLabel,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';

interface EnrollStudentsModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { emails: string[] }) => Promise<void>;
  loading: boolean;
  error: string | null;
  searchEmail: (query: string) => Promise<{ email: string }[]>;
}

export function EnrollStudentsModal({
  open,
  onClose,
  onSubmit,
  loading,
  error,
  searchEmail,
}: EnrollStudentsModalProps) {
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkEmails, setBulkEmails] = useState('');
  const [emailOptions, setEmailOptions] = useState<{ email: string }[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleEmailSearch = async (query: string) => {
    if (!query || query.length < 2) return;
    setSearchLoading(true);
    try {
      const results = await searchEmail(query);
      setEmailOptions(results);
    } catch (err) {
      console.error('Error searching emails:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSuccessMessage(null);
    let emails: string[] = [];

    if (bulkMode) {
      emails = bulkEmails
        .split(',')
        .map((email) => email.trim())
        .filter((email) => email.length > 0);
    } else if (selectedEmail) {
      emails = [selectedEmail];
    }

    if (emails.length === 0) return;

    try {
      await onSubmit({ emails });
      if (!error) {
        setSuccessMessage('Students enrolled successfully!');
        setSelectedEmail(null);
        setBulkEmails('');
      }
    } catch (err) {
      setSuccessMessage(null);
    }
  };

  const isSubmitDisabled = bulkMode ? !bulkEmails.trim() : !selectedEmail;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Enroll Students
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
        <Box sx={{ mt: 1 }}>
          <FormControlLabel
            control={
              <Checkbox checked={bulkMode} onChange={(e) => setBulkMode(e.target.checked)} />
            }
            label="Bulk Enroll"
          />

          {bulkMode ? (
            <TextField
              fullWidth
              label="Paste emails (comma separated)"
              multiline
              rows={4}
              value={bulkEmails}
              onChange={(e) => setBulkEmails(e.target.value)}
              placeholder="email1@example.com, email2@example.com, ..."
              sx={{ mt: 2 }}
            />
          ) : (
            <Autocomplete
              fullWidth
              value={selectedEmail ? { email: selectedEmail } : null}
              onChange={(_, newValue) => setSelectedEmail(newValue?.email || null)}
              options={emailOptions}
              getOptionLabel={(option) => option.email}
              loading={searchLoading}
              onInputChange={(_, value) => handleEmailSearch(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search student email"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {searchLoading ? <CircularProgress size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              sx={{ mt: 2 }}
            />
          )}

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
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={loading || isSubmitDisabled}
          startIcon={loading && <CircularProgress size={20} />}
        >
          Enroll
        </Button>
      </DialogActions>
    </Dialog>
  );
}
