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
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Typography,
  CircularProgress,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Iconify } from 'src/components/iconify';
import { useBatches } from 'src/hooks/use-batches';

interface AddResourceModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    fileType: string;
    file: File;
    batchIds: string[];
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
  const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>([]);
  
  const { batches, loading: batchesLoading, error: batchesError, fetchBatches } = useBatches(0, 100);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleBatchToggle = (batchId: string) => {
    setSelectedBatchIds((prev) =>
      prev.includes(batchId)
        ? prev.filter((id) => id !== batchId)
        : [...prev, batchId]
    );
  };

  const handleSubmit = async () => {
    if (!file) return;

    const success = await onSubmit({
      title,
      description,
      fileType: file.type,
      file,
      batchIds: selectedBatchIds,
    });

    if (success) {
      setTitle('');
      setDescription('');
      setFile(null);
      setSelectedBatchIds([]);
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
              accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.csv"
            />
          </Button>
          {file && (
            <Alert severity="info">
              Selected file: {file.name}
            </Alert>
          )}

          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Select Batches
          </Typography>
          
          {batchesLoading ? (
            <Box display="flex" justifyContent="center" p={2}>
              <CircularProgress size={24} />
            </Box>
          ) : batchesError ? (
            <Alert severity="error">{batchesError}</Alert>
          ) : (
            <List sx={{ maxHeight: 200, overflow: 'auto' }}>
              {batches.map((batch) => (
                <ListItem
                  key={batch._id}
                  divider
                  sx={{
                    '&:last-child': {
                      borderBottom: 'none',
                    },
                  }}
                >
                  <Checkbox
                    edge="start"
                    checked={selectedBatchIds.includes(batch._id)}
                    onChange={() => handleBatchToggle(batch._id)}
                  />
                  <ListItemText
                    primary={batch.title}
                    secondary={batch.description}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <LoadingButton
          onClick={handleSubmit}
          loading={loading}
          disabled={!title || !description || !file || selectedBatchIds.length === 0}
          variant="contained"
        >
          Add Resource
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
} 