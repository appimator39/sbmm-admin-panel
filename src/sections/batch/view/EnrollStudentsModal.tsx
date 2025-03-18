import { useState } from 'react';
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
  Typography,
  Stack,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';

interface EnrollStudentsModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { emails: string[] }) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function EnrollStudentsModal({
  open,
  onClose,
  onSubmit,
  loading,
  error,
}: EnrollStudentsModalProps) {
  const [bulkEmails, setBulkEmails] = useState('');
  const [fileError, setFileError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
              // Remove quotes and trim
              field.replace(/^"|"$/g, '').trim()
            );
            return fields[3] || ''; // Email is at index 3
          }).filter(email => email && email.includes('@'));

          if (emails.length === 0) {
            setFileError('No valid email addresses found in the CSV file.');
            return;
          }

          setBulkEmails(emails.join(', '));
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

          setBulkEmails(emails.join(', '));
        } catch (err) {
          setFileError('Error processing the Excel file. Please check the file format.');
          console.error('Error processing Excel file:', err);
        }
      };
    }
  };

  const handleSubmit = async () => {
    setSuccessMessage(null);
    const emails = bulkEmails
      .split(',')
      .map((email) => email.trim())
      .filter((email) => email.length > 0);

    if (emails.length === 0) return;

    try {
      await onSubmit({ emails });
      if (!error) {
        setSuccessMessage('Students enrolled successfully!');
        setBulkEmails('');
      }
    } catch (err) {
      setSuccessMessage(null);
    }
  };

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
            <Alert severity="error" sx={{ mb: 2 }}>
              {fileError}
            </Alert>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Or paste emails manually (comma separated):
          </Typography>

          <TextField
            fullWidth
            label="Paste emails (comma separated)"
            multiline
            rows={4}
            value={bulkEmails}
            onChange={(e) => setBulkEmails(e.target.value)}
            placeholder="email1@example.com, email2@example.com, ..."
          />

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
          disabled={loading || !bulkEmails.trim()}
          startIcon={loading && <CircularProgress size={20} />}
        >
          Enroll
        </Button>
      </DialogActions>
    </Dialog>
  );
}
