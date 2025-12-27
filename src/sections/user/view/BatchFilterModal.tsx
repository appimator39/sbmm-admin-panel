import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Typography,
  Box,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Iconify } from 'src/components/iconify';
import { useBatches } from 'src/hooks/use-batches';

interface BatchFilterModalProps {
  open: boolean;
  onClose: () => void;
  onApplyFilter: (batchIds: string[], noBatchOnly: boolean) => void;
  selectedBatchIds: string[];
  noBatchOnly: boolean;
}

export function BatchFilterModal({
  open,
  onClose,
  onApplyFilter,
  selectedBatchIds,
  noBatchOnly,
}: BatchFilterModalProps) {
  const [selectedBatches, setSelectedBatches] = useState<string[]>(selectedBatchIds);
  const [noBatch, setNoBatch] = useState<boolean>(noBatchOnly);
  const { batches, loading, error, fetchBatches } = useBatches(0, 100); // Fetch up to 100 batches

  useEffect(() => {
    if (open) {
      fetchBatches();
      setSelectedBatches(selectedBatchIds);
      setNoBatch(noBatchOnly);
    }
  }, [open, selectedBatchIds, noBatchOnly, fetchBatches]);

  const handleToggleBatch = (batchId: string) => {
    setSelectedBatches((prev) =>
      prev.includes(batchId) ? prev.filter((id) => id !== batchId) : [...prev, batchId]
    );
  };

  const handleApplyFilter = () => {
    onApplyFilter(selectedBatches, noBatch);
    onClose();
  };

  const handleClearFilter = () => {
    setSelectedBatches([]);
    setNoBatch(false);
    onApplyFilter([], false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Filter by Batches</Typography>
          <IconButton onClick={onClose}>
            <Iconify icon="mdi:close" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box display="flex" alignItems="center" mb={2}>
          <FormControlLabel
            control={<Checkbox checked={noBatch} onChange={(e) => setNoBatch(e.target.checked)} />}
            label="Only users without any batch"
          />
        </Box>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : batches.length === 0 ? (
          <Typography color="text.secondary" align="center">
            No batches available
          </Typography>
        ) : (
          <List>
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
                  checked={selectedBatches.includes(batch._id)}
                  onChange={() => handleToggleBatch(batch._id)}
                  disabled={noBatch}
                />
                <ListItemText primary={batch.title} secondary={batch.description} />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClearFilter}>Clear Filter</Button>
        <Button onClick={handleApplyFilter} variant="contained">
          Apply Filter
        </Button>
      </DialogActions>
    </Dialog>
  );
}
