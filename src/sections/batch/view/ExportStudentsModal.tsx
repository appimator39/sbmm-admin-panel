import { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  LinearProgress,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import httpService from 'src/services/httpService';

interface ExportStudentsModalProps {
  open: boolean;
  onClose: () => void;
  batchId: string;
  batchTitle: string;
  totalStudents: number;
}

interface UsersResponse {
  statusCode: number;
  message: string;
  data: {
    users: { email: string }[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

const CHUNK_SIZE = 300;

export function ExportStudentsModal({
  open,
  onClose,
  batchId,
  batchTitle,
  totalStudents,
}: ExportStudentsModalProps) {
  const [format, setFormat] = useState<'excel' | 'csv'>('excel');
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fetchedCount, setFetchedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    if (!exporting) {
      setProgress(0);
      setFetchedCount(0);
      setError(null);
      onClose();
    }
  }, [exporting, onClose]);

  const fetchAllEmails = async (): Promise<string[]> => {
    const allEmails: string[] = [];
    const totalPages = Math.ceil(totalStudents / CHUNK_SIZE);

    for (let page = 1; page <= totalPages; page += 1) {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: CHUNK_SIZE.toString(),
      });
      queryParams.append('batchIds', batchId);

      // eslint-disable-next-line no-await-in-loop
      const response = await httpService.get<UsersResponse>(
        `/users/admin/users?${queryParams.toString()}`
      );

      const emails = response.data.data.users.map((user) => user.email);
      allEmails.push(...emails);

      setFetchedCount(allEmails.length);
      setProgress(Math.round((allEmails.length / totalStudents) * 100));
    }

    return allEmails;
  };

  const exportToExcel = (emails: string[]) => {
    const data = emails.map((email) => ({ Email: email }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');

    // Set column width
    worksheet['!cols'] = [{ wch: 40 }];

    const fileName = `${batchTitle.replace(/[^a-zA-Z0-9]/g, '_')}_students.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const exportToCsv = (emails: string[]) => {
    const csvContent = ['Email', ...emails].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${batchTitle.replace(/[^a-zA-Z0-9]/g, '_')}_students.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    setExporting(true);
    setProgress(0);
    setFetchedCount(0);
    setError(null);

    try {
      const emails = await fetchAllEmails();

      if (format === 'excel') {
        exportToExcel(emails);
      } else {
        exportToCsv(emails);
      }

      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to export students');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Iconify icon="mdi:download" width={24} />
          Export Student Emails
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Export emails of <strong>{totalStudents.toLocaleString()}</strong> students from batch{' '}
            <strong>{batchTitle}</strong>
          </Typography>

          <FormControl component="fieldset">
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Export Format
            </Typography>
            <RadioGroup
              value={format}
              onChange={(e) => setFormat(e.target.value as 'excel' | 'csv')}
              row
            >
              <FormControlLabel
                value="excel"
                control={<Radio />}
                label={
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Iconify icon="mdi:file-excel" color="success.main" />
                    Excel (.xlsx)
                  </Box>
                }
                disabled={exporting}
              />
              <FormControlLabel
                value="csv"
                control={<Radio />}
                label={
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Iconify icon="mdi:file-delimited" color="info.main" />
                    CSV (.csv)
                  </Box>
                }
                disabled={exporting}
              />
            </RadioGroup>
          </FormControl>
        </Box>

        {exporting && (
          <Box sx={{ mb: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Fetching emails...
              </Typography>
              <Typography variant="body2" color="primary">
                {fetchedCount.toLocaleString()} / {totalStudents.toLocaleString()}
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {progress}% complete
            </Typography>
          </Box>
        )}

        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={handleClose} disabled={exporting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleExport}
          disabled={exporting || totalStudents === 0}
          startIcon={
            exporting ? (
              <Iconify icon="mdi:loading" className="animate-spin" />
            ) : (
              <Iconify icon="mdi:download" />
            )
          }
        >
          {exporting ? 'Exporting...' : 'Export'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

