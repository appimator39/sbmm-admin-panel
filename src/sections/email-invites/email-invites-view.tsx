import { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';

import {
  Box,
  Alert,
  Button,
  TextField,
  Typography,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  Divider,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { useBatches } from 'src/hooks/use-batches';
import { DashboardContent } from 'src/layouts/dashboard';
import { html as htmlLang } from '@codemirror/lang-html';
import { oneDark } from '@codemirror/theme-one-dark';
import CodeMirror from '@uiw/react-codemirror';
import httpService from 'src/services/httpService';

export function EmailInvitesView() {
  const NO_BATCH_SENTINEL = '__USERS_WITHOUT_BATCHES__';

  // Recipients state
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [fileError, setFileError] = useState<string | null>(null);
  const [excelEmails, setExcelEmails] = useState<string[]>([]);
  const [manualEmails, setManualEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');

  // Email content state
  const [subject, setSubject] = useState('');
  const [htmlContent, setHtmlContent] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { batches } = useBatches(0, 100);

  const isContentEmpty = (content: string) => content.trim().length === 0;

  // Generate preview HTML - use as-is if full doc, otherwise wrap
  const previewHtmlString = useMemo(() => {
    if (!previewOpen) return '';
    const trimmed = htmlContent.trim();
    if (!trimmed) return '';

    const isFullDoc = /^<!DOCTYPE|^<html|^<head/im.test(trimmed);
    if (isFullDoc) return trimmed;

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      padding: 20px;
      color: #333;
    }
  </style>
</head>
<body>
${trimmed}
</body>
</html>`;
  }, [previewOpen, htmlContent]);

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

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
          setExcelEmails(emails);
        } catch (err) {
          setFileError('Error processing the CSV file. Please check the file format.');
        }
      };
    } else {
      reader.readAsBinaryString(file);
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const parsedData = XLSX.utils.sheet_to_json(sheet);
          const emails = parsedData
            .map((row: any) => row['Personal Email'] || row.Email || row.email)
            .filter((email: string) => email && email.includes('@'));

          if (emails.length === 0) {
            setFileError('No valid email addresses found in the Excel file.');
            return;
          }
          setExcelEmails(emails);
        } catch (err) {
          setFileError('Error processing the Excel file. Please check the file format.');
        }
      };
    }
  };

  const handleSubmit = async () => {
    if (!subject.trim() || isContentEmpty(htmlContent)) return;

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
        description: htmlContent.trim(),
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

      setSubject('');
      setHtmlContent('');
      setExcelEmails([]);
      setManualEmails([]);
      setSelectedBatch('');
    } catch (err: any) {
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

  const canPreview = subject.trim().length > 0 || !isContentEmpty(htmlContent);
  const canSend =
    !loading &&
    subject.trim().length > 0 &&
    !isContentEmpty(htmlContent) &&
    ((selectedTab === 0 && selectedBatch) ||
      (selectedTab === 1 && (excelEmails.length > 0 || manualEmails.length > 0)));

  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4">Send Email Invitations</Typography>
      </Box>

      <Card sx={{ p: 3 }}>
        {/* Recipients Selection */}
        <Tabs
          value={selectedTab}
          onChange={(_, newValue) => setSelectedTab(newValue)}
          sx={{ mb: 3 }}
        >
          <Tab label="Send to Batch" />
          <Tab label="Send via Excel" />
        </Tabs>

        {selectedTab === 0 ? (
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Select Batch</InputLabel>
            <Select
              value={selectedBatch}
              label="Select Batch"
              onChange={(e) => setSelectedBatch(e.target.value)}
            >
              <MenuItem value={NO_BATCH_SENTINEL}>Users without batches</MenuItem>
              {batches.map((batch) => (
                <MenuItem key={batch._id} value={batch._id} disabled={batch.students.length === 0}>
                  {batch.title} ({batch.students.length} students)
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <Box sx={{ mb: 3 }}>
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
                    <Chip key={index} label={email} color="primary" variant="outlined" />
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

        <Divider sx={{ my: 3 }} />

        {/* Email Subject */}
        <TextField
          fullWidth
          label="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          sx={{ mb: 3 }}
          required
        />

        {/* Email Body - HTML Editor */}
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              Email Body (HTML)
            </Typography>
            <Button
              variant="outlined"
              size="small"
              color="info"
              onClick={() => setPreviewOpen(true)}
              startIcon={<Iconify icon="mdi:eye" />}
              disabled={!canPreview}
            >
              Preview
            </Button>
          </Box>

          <Box
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              overflow: 'hidden',
            }}
          >
            <CodeMirror
              value={htmlContent}
              height="450px"
              theme={oneDark}
              extensions={[htmlLang()]}
              onChange={(value) => setHtmlContent(value)}
              placeholder="Paste your HTML email template here..."
            />
          </Box>
        </Box>

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            onClick={handleSubmit}
            variant="contained"
            size="large"
            disabled={!canSend}
            startIcon={
              loading ? <CircularProgress size={20} color="inherit" /> : <Iconify icon="mdi:send" />
            }
          >
            Send Emails
          </Button>
        </Stack>
      </Card>

      {/* Preview Modal */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { minHeight: '80vh' },
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1}>
              <Iconify icon="mdi:email-open" width={24} />
              <Typography variant="h6">Email Preview</Typography>
            </Stack>
            <IconButton onClick={() => setPreviewOpen(false)} size="small">
              <Iconify icon="mdi:close" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <Box sx={{ p: 2, bgcolor: 'grey.100' }}>
            <Typography variant="caption" color="text.secondary">
              SUBJECT
            </Typography>
            <Typography variant="h6" sx={{ mt: 0.5 }}>
              {subject || '(No subject)'}
            </Typography>
          </Box>
          <Divider />
          <Box sx={{ height: 'calc(80vh - 200px)', overflow: 'hidden', bgcolor: '#f5f5f5' }}>
            <iframe
              title="email-preview"
              srcDoc={previewHtmlString}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                display: 'block',
                backgroundColor: 'white',
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Button
            onClick={() => {
              const newWindow = window.open('', '_blank');
              if (newWindow) {
                newWindow.document.write(previewHtmlString);
                newWindow.document.close();
              }
            }}
            variant="text"
            startIcon={<Iconify icon="mdi:open-in-new" />}
          >
            Open in New Tab
          </Button>
          <Button onClick={() => setPreviewOpen(false)} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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
