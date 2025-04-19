import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Iconify } from 'src/components/iconify';

interface AddResourceModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    fileType: string;
    file: File;
  }) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

export function AddResourceModal({
  open,
  onClose,
  onSubmit,
  loading,
  error,
}: AddResourceModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;

    const success = await onSubmit({
      title,
      description,
      fileType: file.type,
      file,
    });

    if (success) {
      setTitle('');
      setDescription('');
      setFile(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Resource</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
          />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
          />
          <Button
            variant="outlined"
            component="label"
            startIcon={<Iconify icon="solar:upload-bold" />}
          >
            Upload File
            <input
              type="file"
              hidden
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.zip"
            />
          </Button>
          {file && (
            <Alert severity="info">
              Selected file: {file.name}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <LoadingButton
          onClick={handleSubmit}
          loading={loading}
          disabled={!title || !description || !file}
          variant="contained"
        >
          Add Resource
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
} 