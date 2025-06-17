import { useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import Typography from '@mui/material/Typography';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';
import Chip from '@mui/material/Chip';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { DashboardContent } from 'src/layouts/dashboard';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import httpService from 'src/services/httpService';
import { Certificate, CertificateResponse } from '../types';
import { AddCertificateModal } from './AddCertificateModal';

// ----------------------------------------------------------------------

export function CertificatesView() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    certificateId: string;
    title: string;
  }>({
    open: false,
    certificateId: '',
    title: '',
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const fetchCertificates = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await httpService.get<CertificateResponse>(
        `/certificates?page=${page + 1}&limit=${rowsPerPage}`
      );
      console.log('API Response:', response.data);
      
      // Check if response has expected structure
      if (response.data?.data?.certificates) {
        setCertificates(response.data.data.certificates);
        setTotalCount(response.data.data.pagination?.totalRecords || 0);
      } else {
        console.error('Unexpected API response structure:', response.data);
        setError('Unexpected response format from server');
        setCertificates([]);
        setTotalCount(0);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch certificates');
      console.error('Error fetching certificates:', err);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteClick = (certificateId: string, title: string) => {
    setConfirmDialog({
      open: true,
      certificateId,
      title,
    });
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await httpService.delete(`/certificates/${confirmDialog.certificateId}`);
      setSnackbar({
        open: true,
        message: 'Certificate deleted successfully',
        severity: 'success',
      });
      await fetchCertificates();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to delete certificate',
        severity: 'error',
      });
      console.error('Error deleting certificate:', err);
    } finally {
      setDeleteLoading(false);
      setConfirmDialog({ open: false, certificateId: '', title: '' });
    }
  };

  const handleDeleteCancel = () => {
    setConfirmDialog({ open: false, certificateId: '', title: '' });
  };

  const handleCertificateAdded = () => {
    setSnackbar({
      open: true,
      message: 'Certificate created successfully',
      severity: 'success',
    });
    fetchCertificates();
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'issued':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getCertificateTypeColor = (type: string) => {
    switch (type) {
      case 'batch':
        return 'primary';
      case 'course':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>
          Certificates
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleOpenModal}
        >
          New Certificate
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height={400}>
                <CircularProgress />
              </Box>
            ) : (
              <Table sx={{ minWidth: 800 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Course/Batch</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Issued By</TableCell>
                    <TableCell>Issue Date</TableCell>
                    <TableCell>Students</TableCell>
                    <TableCell>Downloads</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {certificates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                          <Iconify icon="solar:diploma-bold" width={64} sx={{ color: 'text.disabled' }} />
                          <Typography variant="h6" color="text.secondary">
                            No certificates found
                          </Typography>
                          <Typography variant="body2" color="text.disabled">
                            Create your first certificate to get started
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    certificates.map((certificate) => (
                      <TableRow key={certificate._id} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2" noWrap>
                              {certificate.batchName || certificate.courseId.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {certificate.description}
                            </Typography>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={certificate.certificateType}
                            color={getCertificateTypeColor(certificate.certificateType) as any}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={certificate.status}
                            color={getStatusColor(certificate.status) as any}
                            size="small"
                            variant="filled"
                          />
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2">
                            {certificate.issuedByName}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(certificate.issueDate)}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {certificate.metadata.eligibleCount} / {certificate.metadata.totalStudents}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Eligible / Total
                            </Typography>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2">
                            {certificate.downloadCount}
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          <Tooltip title="Delete certificate">
                            <IconButton
                              onClick={() => handleDeleteClick(certificate._id, certificate.batchName || certificate.courseId.title)}
                              color="error"
                              disabled={deleteLoading}
                            >
                              <Iconify icon="solar:trash-bin-trash-bold" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        </Scrollbar>

        <TablePagination
          component="div"
          page={page}
          count={totalCount}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 20, 50]}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      <AddCertificateModal
        open={openModal}
        onClose={handleCloseModal}
        onCertificateAdded={handleCertificateAdded}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        onClose={handleDeleteCancel}
        title="Delete Certificate"
        content={`Are you sure you want to delete the certificate for "${confirmDialog.title}"? This action cannot be undone.`}
        action={
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={20} /> : <Iconify icon="solar:trash-bin-trash-bold" />}
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        }
      />

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
    </DashboardContent>
  );
} 