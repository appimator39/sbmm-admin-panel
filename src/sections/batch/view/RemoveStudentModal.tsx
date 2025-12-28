import { useState } from 'react';
import * as XLSX from 'xlsx';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { Iconify } from 'src/components/iconify';

interface RemoveStudentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { emails: string[] }) => Promise<{
    successful: Array<{ email: string; userId?: string }>;
    skipped: Array<{ email: string; reason: string }>;
    failed: Array<{ email: string; reason: string }>;
    batchId: string;
    totalStudentsInBatch: number;
    summary: { total: number; removed: number; skipped: number; failed: number };
  }>;
  loading?: boolean;
  error?: string | null;
}

export function RemoveStudentModal({
  open,
  onClose,
  onSubmit,
  loading = false,
  error = null,
}: RemoveStudentModalProps) {
  const [bulkEmails, setBulkEmails] = useState('');
  const [fileError, setFileError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [result, setResult] = useState<{
    successful: Array<{ email: string; userId?: string }>;
    skipped: Array<{ email: string; reason: string }>;
    failed: Array<{ email: string; reason: string }>;
    batchId: string;
    totalStudentsInBatch: number;
    summary: { total: number; removed: number; skipped: number; failed: number };
  } | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileError(null);
    const reader = new FileReader();

    if (file.name.toLowerCase().endsWith('.csv')) {
      reader.readAsText(file);
      reader.onload = (e) => {
        try {
          const csvData = e.target?.result as string;
          const rows = csvData.split('\n').filter((row) => row.trim());
          const emails = rows
            .map((row) => {
              const fields = row.split(';').map((field) => field.replace(/^"|"$/g, '').trim());
              return fields[3] || '';
            })
            .filter((email) => email && email.includes('@'));

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
      reader.readAsBinaryString(file);
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data as string, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const parsedData = XLSX.utils.sheet_to_json(sheet);

          const emails = (parsedData as any[])
            .map((row) => row['Personal Email'] || row.Email || row.email)
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
    setResult(null);
    const emails = bulkEmails
      .split(',')
      .map((email) => email.trim())
      .filter((email) => email.length > 0);

    if (emails.length === 0) return;

    try {
      const response = await onSubmit({ emails });
      setResult(response);
      const { summary } = response;
      setSuccessMessage(
        `Removed: ${summary.removed}, Skipped: ${summary.skipped}, Failed: ${summary.failed}`
      );
    } catch (err) {
      setSuccessMessage(null);
    }
  };

  const handleClose = () => {
    setBulkEmails('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Remove Students
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
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
              id="excel-file-upload-remove"
              type="file"
              onChange={handleFileUpload}
            />
            <Button
              component="label"
              htmlFor="excel-file-upload-remove"
              variant="outlined"
              startIcon={<Iconify icon="mdi:file-excel" />}
            >
              Upload Excel File
            </Button>

            <input
              accept=".csv"
              style={{ display: 'none' }}
              id="csv-file-upload-remove"
              type="file"
              onChange={handleFileUpload}
            />
            <Button
              component="label"
              htmlFor="csv-file-upload-remove"
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
          {result && result.successful.length > 0 && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Removed
            </Alert>
          )}
          {result && result.successful.length > 0 && (
            <Box sx={{ mt: 1 }}>
              {result.successful.map((item) => (
                <Typography key={item.email} variant="body2">
                  {item.email}
                </Typography>
              ))}
            </Box>
          )}
          {result && result.skipped.length > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Skipped
            </Alert>
          )}
          {result && result.skipped.length > 0 && (
            <Box sx={{ mt: 1 }}>
              {result.skipped.map((item) => (
                <Typography key={item.email} variant="body2">
                  {item.email}: {item.reason}
                </Typography>
              ))}
            </Box>
          )}
          {result && result.failed.length > 0 && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Failed
            </Alert>
          )}
          {result && result.failed.length > 0 && (
            <Box sx={{ mt: 1 }}>
              {result.failed.map((item) => (
                <Typography key={item.email} variant="body2">
                  {item.email}: {item.reason}
                </Typography>
              ))}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit" disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="error"
          disabled={loading || !bulkEmails.trim()}
          startIcon={loading && <CircularProgress size={20} />}
        >
          Remove
        </Button>
      </DialogActions>
    </Dialog>
  );
}
