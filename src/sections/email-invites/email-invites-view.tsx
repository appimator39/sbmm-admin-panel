import { useState } from 'react';
import * as XLSX from 'xlsx';

import {
  Box,
  Alert,
  Button,
  TextField,
  Typography,
  Stack,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CircularProgress,
  Snackbar,
  Chip,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { useBatches } from 'src/hooks/use-batches';
import { DashboardContent } from 'src/layouts/dashboard';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import httpService from 'src/services/httpService';

export function EmailInvitesView() {
  const NO_BATCH_SENTINEL = '__USERS_WITHOUT_BATCHES__';
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [fileError, setFileError] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [excelEmails, setExcelEmails] = useState<string[]>([]);
  const [manualEmails, setManualEmails] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [newEmail, setNewEmail] = useState('');

  const { batches, fetchBatches } = useBatches(0, 100);

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileError(null);
    const reader = new FileReader();

    if (file.name.toLowerCase().endsWith('.csv')) {
      // Handle CSV file
      reader.readAsText(file);
      reader.onload = (e) => {
        try {
          const csvData = e.target?.result as string;
          // Split by newlines and filter out empty lines
          const rows = csvData.split('\n').filter(row => row.trim());
          
          // Process each row
          const emails = rows.map(row => {
            // Split by semicolon and get the email field (index 3)
            const fields = row.split(';').map(field => 
              field.replace(/^"|"$/g, '').trim()
            );
            return fields[3] || ''; // Email is at index 3
          }).filter(email => email && email.includes('@'));

          if (emails.length === 0) {
            setFileError('No valid email addresses found in the CSV file.');
            return;
          }

          setExcelEmails(emails);
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

          // Extract emails from the Excel file
          const emails = parsedData
            .map((row: any) => row["Personal Email"] || row.Email || row.email)
            .filter((email: string) => email && email.includes('@'));

          if (emails.length === 0) {
            setFileError('No valid email addresses found in the Excel file.');
            return;
          }

          setExcelEmails(emails);
        } catch (err) {
          setFileError('Error processing the Excel file. Please check the file format.');
          console.error('Error processing Excel file:', err);
        }
      };
    }
  };

  const handleSubmit = async () => {
    if (!subject.trim() || !body.trim()) return;

    setLoading(true);

    try {
      const payload: {
        subject: string;
        description: string;
        batch_id?: string;
        emails?: string[];
        users_without_batches?: boolean;
      } = {
        subject: subject.trim(),
        description: body.trim(),
      };

      if (selectedTab === 0) {
        if (selectedBatch === NO_BATCH_SENTINEL) {
          payload.users_without_batches = true;
        } else {
          const batch = batches.find((b) => b._id === selectedBatch);
          if (batch) {
            payload.batch_id = selectedBatch;
          }
        }
      } else {
        // Combine Excel and manual emails
        payload.emails = [...excelEmails, ...manualEmails];
      }

      if (!payload.batch_id && !payload.emails && !payload.users_without_batches) {
        throw new Error('No valid email addresses found');
      }

      await httpService.post('/email/send', payload);

      setSnackbar({
        open: true,
        message: 'Emails sent successfully!',
        severity: 'success',
      });

      // Reset form
      setSubject('');
      setBody('');
      setExcelEmails([]);
      setManualEmails([]);
      setSelectedBatch('');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to send emails';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4">
          Send Email Invitations
        </Typography>
      </Box>

      <Card sx={{ p: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={(_, newValue) => setSelectedTab(newValue)}
          sx={{ mb: 3 }}
        >
          <Tab label="Send to Batch" />
          <Tab label="Send via Excel" />
        </Tabs>

        {selectedTab === 0 ? (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Select Batch</InputLabel>
            <Select
              value={selectedBatch}
              label="Select Batch"
              onChange={(e) => setSelectedBatch(e.target.value)}
            >
              <MenuItem value={NO_BATCH_SENTINEL}>
                Users without batches
              </MenuItem>
              {batches.map((batch) => (
                <MenuItem 
                  key={batch._id} 
                  value={batch._id}
                  disabled={selectedBatch === NO_BATCH_SENTINEL || batch.students.length === 0}
                >
                  {batch.title} ({batch.students.length} students)
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <Box sx={{ mb: 2 }}>
            <input
              accept=".xlsx,.xls,.csv"
              style={{ display: 'none' }}
              id="email-file-upload"
              type="file"
              onChange={handleFileUpload}
            />
            <Button
              component="label"
              htmlFor="email-file-upload"
              variant="outlined"
              startIcon={<Iconify icon="mdi:file-excel" />}
              sx={{ mb: 2 }}
            >
              Upload Excel/CSV File
            </Button>

            {fileError && (
              <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                {fileError}
              </Typography>
            )}

            {excelEmails.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Emails from Excel ({excelEmails.length})
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {excelEmails.map((email, index) => (
                    <Chip
                      key={index}
                      label={email}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            )}

            <TextField
              fullWidth
              label="Add More Email Addresses"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && newEmail.includes('@')) {
                  e.preventDefault();
                  setManualEmails((prev) => [...prev, newEmail]);
                  setNewEmail('');
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => {
                        if (newEmail.includes('@')) {
                          setManualEmails((prev) => [...prev, newEmail]);
                          setNewEmail('');
                        }
                      }}
                      disabled={!newEmail.includes('@')}
                    >
                      <Iconify icon="mdi:plus" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            {manualEmails.length > 0 && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Additional Emails ({manualEmails.length})
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {manualEmails.map((email, index) => (
                    <Chip
                      key={index}
                      label={email}
                      onDelete={() => {
                        setManualEmails((prev) => prev.filter((_, i) => i !== index));
                      }}
                      color="secondary"
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        )}

        <TextField
          fullWidth
          label="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          sx={{ mb: 2 }}
          required
        />

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Email Body
        </Typography>
        <Box sx={{ height: 300, mb: 3 }}>
          <ReactQuill
            theme="snow"
            value={body}
            onChange={setBody}
            style={{ height: 250 }}
          />
        </Box>

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={
              loading ||
              !subject.trim() ||
              !body.trim() ||
              (selectedTab === 0 && !selectedBatch) ||
              (selectedTab === 1 && excelEmails.length === 0 && manualEmails.length === 0)
            }
            startIcon={loading && <CircularProgress size={20} />}
          >
            Send Emails
          </Button>
        </Stack>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            whiteSpace: 'pre-line',
            '& .MuiAlert-message': {
              maxHeight: '200px',
              overflow: 'auto',
            },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardContent>
  );
} 
