import { useState, DragEvent } from 'react';
import { Box, Typography, Button, Snackbar, Alert, Card, CardContent } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import httpService from 'src/services/httpService';

export default function AppLaunchesView() {
  const [xmlFile, setXmlFile] = useState<File | null>(null);
  const [exeFile, setExeFile] = useState<File | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const onXmlDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles[0]?.type === 'application/xml' || acceptedFiles[0]?.name.endsWith('.xml')) {
      setXmlFile(acceptedFiles[0]);
    } else {
      setSnackbar({
        open: true,
        message: 'Please upload a valid XML file',
        severity: 'error',
      });
    }
  };

  const onExeDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles[0]?.name.endsWith('.exe')) {
      setExeFile(acceptedFiles[0]);
    } else {
      setSnackbar({
        open: true,
        message: 'Please upload a valid EXE file',
        severity: 'error',
      });
    }
  };

  const handleSubmit = async () => {
    if (!xmlFile || !exeFile) {
      setSnackbar({
        open: true,
        message: 'Please upload both XML and EXE files',
        severity: 'error',
      });
      return;
    }

    const formData = new FormData();
    formData.append('xml', xmlFile);
    formData.append('exe', exeFile);

    try {
      await httpService.post('/files/upload-app-files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'accept': '*/*',
        },
      });

      setSnackbar({
        open: true,
        message: 'Files uploaded successfully',
        severity: 'success',
      });

      // Reset files after successful upload
      setXmlFile(null);
      setExeFile(null);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to upload files',
        severity: 'error',
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        App Launches
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* XML File Dropzone */}
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: 'primary.main',
                  },
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const file = e.dataTransfer.files[0];
                  if (file?.type === 'application/xml' || file?.name.endsWith('.xml')) {
                    setXmlFile(file);
                  } else {
                    setSnackbar({
                      open: true,
                      message: 'Please upload a valid XML file',
                      severity: 'error',
                    });
                  }
                }}
                onClick={() => document.getElementById('xml-input')?.click()}
              >
                <input
                  id="xml-input"
                  type="file"
                  accept=".xml"
                  onChange={(e) => {
                    if (e.target.files) {
                      onXmlDrop(Array.from(e.target.files));
                    }
                  }}
                  style={{ display: 'none' }}
                />
                <Iconify icon="mdi:file-xml" sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                <Typography variant="h6">
                  {xmlFile ? xmlFile.name : 'Drag and drop appcast.xml file here'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  or click to select file
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* EXE File Dropzone */}
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: 'primary.main',
                  },
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const file = e.dataTransfer.files[0];
                  if (file?.name.endsWith('.exe')) {
                    setExeFile(file);
                  } else {
                    setSnackbar({
                      open: true,
                      message: 'Please upload a valid EXE file',
                      severity: 'error',
                    });
                  }
                }}
                onClick={() => document.getElementById('exe-input')?.click()}
              >
                <input
                  id="exe-input"
                  type="file"
                  accept=".exe"
                  onChange={(e) => {
                    if (e.target.files) {
                      onExeDrop(Array.from(e.target.files));
                    }
                  }}
                  style={{ display: 'none' }}
                />
                <Iconify icon="mdi:application" sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                <Typography variant="h6">
                  {exeFile ? exeFile.name : 'Drag and drop Windows .exe file here'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  or click to select file
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={!xmlFile || !exeFile}
            startIcon={<Iconify icon="mdi:upload" />}
          >
            Upload Files
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 