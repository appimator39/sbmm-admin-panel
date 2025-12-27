import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material';
import dayjs from 'dayjs';
import httpService from 'src/services/httpService';

type EventItem = {
  type: string;
  positionSec?: number;
  at?: string;
  extra?: any;
};

type LectureProgressModalProps = {
  open: boolean;
  onClose: () => void;
  userId: string;
  lectureId: string;
};

export function LectureProgressModal({ open, onClose, userId, lectureId }: LectureProgressModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!open) return;
      try {
        setLoading(true);
        setError(null);
        const res = await httpService.get<{ data: { events?: EventItem[] } }>(
          `/video-progress/admin/user/${userId}/lecture/${lectureId}`
        );
        setEvents(res.data.data?.events || []);
      } catch (e: any) {
        setError(e.response?.data?.message || 'Failed to fetch lecture events');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [open, userId, lectureId]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Lecture Events</Typography>
          <Button onClick={onClose}>Close</Button>
        </Box>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableBody>
                {events.map((ev, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{ev.type}</TableCell>
                    <TableCell>{typeof ev.positionSec === 'number' ? `${ev.positionSec}s` : '--'}</TableCell>
                    <TableCell>{ev.at ? dayjs(ev.at).format('YYYY-MM-DD HH:mm') : '--'}</TableCell>
                    <TableCell>{ev.extra ? JSON.stringify(ev.extra) : '--'}</TableCell>
                  </TableRow>
                ))}
                {events.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Typography color="text.secondary">No events</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

