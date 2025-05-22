import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
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
import { useBatches } from 'src/hooks/use-batches';

interface EditResourceBatchesModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    resourceId: string;
    batchIds: string[];
  }) => Promise<boolean>;
  loading: boolean;
  error: string | null;
  resourceId: string;
  currentBatchIds: string[];
}

export function EditResourceBatchesModal({
  open,
  onClose,
  onSubmit,
  loading,
  error,
  resourceId,
  currentBatchIds,
}: EditResourceBatchesModalProps) {
  const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>(currentBatchIds);
  
  const { batches, loading: batchesLoading, error: batchesError } = useBatches(0, 100);

  const handleBatchToggle = (batchId: string) => {
    setSelectedBatchIds((prev) =>
      prev.includes(batchId)
        ? prev.filter((id) => id !== batchId)
        : [...prev, batchId]
    );
  };

  const handleSubmit = async () => {
    const success = await onSubmit({
      resourceId,
      batchIds: selectedBatchIds,
    });

    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Resource Batches</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          
          <Typography variant="subtitle1">
            Select Batches
          </Typography>
          
          {batchesLoading ? (
            <Box display="flex" justifyContent="center" p={2}>
              <CircularProgress size={24} />
            </Box>
          ) : batchesError ? (
            <Alert severity="error">{batchesError}</Alert>
          ) : (
            <List sx={{ maxHeight: 300, overflow: 'auto' }}>
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
          disabled={selectedBatchIds.length === 0}
          variant="contained"
        >
          Save Changes
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
} 