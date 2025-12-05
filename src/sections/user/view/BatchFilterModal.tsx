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
  FormControlLabel,
  Switch,
  Divider,
  Chip,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { useBatches } from 'src/hooks/use-batches';

interface BatchFilterModalProps {
  open: boolean;
  onClose: () => void;
  onApplyFilter: (batchIds: string[]) => void;
  selectedBatchIds: string[];
  unassignedMode: boolean;
  onApplyUnassignedMode: (enabled: boolean) => Promise<void> | void;
}

export function BatchFilterModal({
  open,
  onClose,
  onApplyFilter,
  selectedBatchIds,
  unassignedMode,
  onApplyUnassignedMode,
}: BatchFilterModalProps) {
  const [selectedBatches, setSelectedBatches] = useState<string[]>(selectedBatchIds);
  const [unassigned, setUnassigned] = useState<boolean>(unassignedMode);
  const { batches, loading, error, fetchBatches } = useBatches(0, 100); // Fetch up to 100 batches

  useEffect(() => {
    if (open) {
      fetchBatches();
      setSelectedBatches(selectedBatchIds);
      setUnassigned(unassignedMode);
    }
  }, [open, selectedBatchIds, unassignedMode, fetchBatches]);

  const handleToggleBatch = (batchId: string) => {
    setSelectedBatches((prev) =>
      prev.includes(batchId) ? prev.filter((id) => id !== batchId) : [...prev, batchId]
    );
  };

  const handleApplyFilter = () => {
    if (unassigned) {
      onApplyFilter([]);
      onApplyUnassignedMode(true);
    } else {
      onApplyUnassignedMode(false);
      onApplyFilter(selectedBatches);
    }
    onClose();
  };

  const handleClearFilter = () => {
    setSelectedBatches([]);
    onApplyFilter([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <Iconify icon="mdi:filter-variant" />
            <Typography variant="h6">Filter Users</Typography>
            <Chip label={selectedBatches.length} size="small" sx={{ ml: 1 }} />
          </Box>
          <IconButton onClick={onClose}>
            <Iconify icon="mdi:close" />
          </IconButton>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Select batches or enable Other Users to view users without batch.
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <FormControlLabel
            control={
              <Switch checked={unassigned} onChange={(e) => setUnassigned(e.target.checked)} />
            }
            label="Other Users (no batch)"
          />
        </Box>
        <Divider sx={{ mb: 2 }} />
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : error ? (
          /permission|forbidden/i.test(error) ? (
            <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
              <Iconify icon="mdi:shield-off-outline" />
              <Typography variant="body2" color="text.secondary">
                You don&apos;t have access to view batches. You can still enable Other Users.
              </Typography>
            </Box>
          ) : (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )
        ) : batches.length === 0 ? (
          <Typography color="text.secondary" align="center">
            No batches available
          </Typography>
        ) : (
          <List
            sx={{
              opacity: unassigned ? 0.5 : 1,
              pointerEvents: unassigned ? ('none' as any) : 'auto',
            }}
          >
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
                />
                <ListItemText primary={batch.title} secondary={batch.description} />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClearFilter} startIcon={<Iconify icon="mdi:filter-off-outline" />}>
          Clear
        </Button>
        <Button
          onClick={handleApplyFilter}
          variant="contained"
          startIcon={<Iconify icon="mdi:check-bold" />}
        >
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
}
