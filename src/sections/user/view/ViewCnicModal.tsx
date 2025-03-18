import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';
import { Iconify } from 'src/components/iconify';
import httpService from 'src/services/httpService';

interface ViewCnicModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  idVerified: boolean;
  onVerificationChange: (verified: boolean) => void;
}

interface CnicImagesResponse {
  statusCode: number;
  message: string;
  data: {
    frontUrl: string;
    backUrl: string;
  };
}

export function ViewCnicModal({ open, onClose, userId, idVerified, onVerificationChange }: ViewCnicModalProps) {
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<CnicImagesResponse['data'] | null>(null);

  const fetchCnicImages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await httpService.get<CnicImagesResponse>(`/users/admin/cnic-images/${userId}`);
      setImages(response.data.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('User has not uploaded their CNIC images');
      } else {
        setError('Failed to fetch CNIC images');
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const handleToggleVerification = async () => {
    setVerifying(true);
    setError(null);
    try {
      await onVerificationChange(!idVerified);
    } catch (err: any) {
      setError('Failed to update verification status');
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchCnicImages();
    } else {
      // Clear images when modal is closed
      setImages(null);
    }
  }, [open, fetchCnicImages]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        View CNIC Images
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
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            {error}
          </Alert>
        ) : images ? (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ mb: 3 }}>
              <Box component="h3" sx={{ mb: 1 }}>
                Front Side
              </Box>
              <Box
                component="img"
                src={images.frontUrl}
                alt="CNIC Front"
                sx={{
                  width: '100%',
                  maxHeight: 400,
                  objectFit: 'contain',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              />
            </Box>

            <Box>
              <Box component="h3" sx={{ mb: 1 }}>
                Back Side
              </Box>
              <Box
                component="img"
                src={images.backUrl}
                alt="CNIC Back"
                sx={{
                  width: '100%',
                  maxHeight: 400,
                  objectFit: 'contain',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              />
            </Box>

            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              {idVerified ? (
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleToggleVerification}
                  disabled={verifying}
                  startIcon={verifying ? <CircularProgress size={20} /> : <Iconify icon="eva:close-circle-fill" />}
                >
                  {verifying ? 'Unverifying...' : 'Unverify ID'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleToggleVerification}
                  disabled={verifying}
                  startIcon={verifying ? <CircularProgress size={20} /> : <Iconify icon="eva:checkmark-circle-fill" />}
                >
                  {verifying ? 'Verifying...' : 'Verify ID'}
                </Button>
              )}

              <Alert severity="info" sx={{ width: '100%' }}>
                Images will expire in 30 minutes
              </Alert>
            </Box>
          </Box>
        ) : null}
      </DialogContent>
    </Dialog>
  );
} 