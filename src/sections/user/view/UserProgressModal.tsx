import { useEffect, useState, useMemo } from 'react';
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
  TableHead,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  LinearProgress,
  Chip,
} from '@mui/material';
import httpService from 'src/services/httpService';
import { Scrollbar } from 'src/components/scrollbar';
import { LectureProgressModal } from './LectureProgressModal';

type AllCoursesProgress = {
  totalCourses: number;
  courses: Array<{
    courseId: string;
    title: string;
    totalLectures: number;
    completedLectures: number;
    avgPercent: number;
    items: Array<{
      lectureId: string;
      title: string;
      order?: number;
      durationSec?: number;
      watchedSec?: number;
      percent: number;
      completed: boolean;
      lastPositionSec?: number;
      seekCount?: number;
      lastSeekAt?: string;
      skipEvents?: Array<{ fromSec: number; toSec: number | null; at: string }>;
    }>;
  }>;
};

type UserProgressModalProps = {
  open: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
};

export function UserProgressModal({ open, onClose, userId, userName }: UserProgressModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allSummary, setAllSummary] = useState<AllCoursesProgress | null>(null);
  const [openLectureModal, setOpenLectureModal] = useState(false);
  const [selectedLectureId, setSelectedLectureId] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllSummary = async () => {
      if (!open) {
        setAllSummary(null);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const res = await httpService.get<{ data: AllCoursesProgress }>(
          `/video-progress/admin/user/${userId}/all-courses`
        );
        setAllSummary(res.data.data || null);
      } catch (e: any) {
        setError(e.response?.data?.message || 'Failed to fetch progress');
        setAllSummary(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAllSummary();
  }, [open, userId]);

  const percentFmt = (val?: number) => (typeof val === 'number' ? `${Math.round(val)}%` : '--');
  const toTime = (sec?: number) => {
    if (typeof sec !== 'number' || sec <= 0) return '--';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };
  const courses = useMemo(() => allSummary?.courses || [], [allSummary]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{ sx: { width: '48vw', maxWidth: '48vw' } }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">{`Progress: ${userName}`}</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : allSummary ? (
          <Box>
            <Box display="flex" gap={3} mb={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Total courses
                </Typography>
                <Typography variant="h6">{allSummary.totalCourses}</Typography>
              </Box>
            </Box>

            <Scrollbar>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Course</TableCell>
                      <TableCell>Average</TableCell>
                      <TableCell>Watched</TableCell>
                      <TableCell>Completed</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {courses.map((c) => (
                      <TableRow
                        key={c.courseId}
                        hover
                        onClick={() => setSelectedCourseId(c.courseId)}
                      >
                        <TableCell align="left">{c.title}</TableCell>
                        <TableCell align="center">
                          <Box minWidth={160}>
                            <Box display="flex" justifyContent="space-between" mb={0.5}>
                              <Typography variant="caption" color="text.secondary">
                                {percentFmt(c.avgPercent)}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >{`${c.completedLectures}/${c.totalLectures}`}</Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(Math.max(c.avgPercent || 0, 0), 100)}
                            />
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          {`${(c.items || []).filter((lec) => (lec.watchedSec || 0) > 0 || (lec.percent || 0) > 0 || (lec.lastPositionSec || 0) > 0).length}/${c.items?.length || 0}`}
                        </TableCell>
                        <TableCell align="center">{`${c.completedLectures}/${c.totalLectures}`}</TableCell>
                      </TableRow>
                    ))}
                    {courses.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4}>
                          <Typography color="text.secondary">No course progress</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>

            {selectedCourseId && (
              <Box mt={3}>
                <Typography variant="subtitle1">Lecture details</Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Lecture</TableCell>
                        <TableCell>Percent</TableCell>
                        <TableCell>Completed</TableCell>
                        <TableCell>Watched/Duration</TableCell>
                        <TableCell>Seeks</TableCell>
                        <TableCell>Last Position</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(courses.find((c) => c.courseId === selectedCourseId)?.items || []).map(
                        (lec) => (
                          <TableRow key={lec.lectureId}>
                            <TableCell align="center">{lec.title}</TableCell>
                            <TableCell align="center">{percentFmt(lec.percent)}</TableCell>
                            <TableCell align="center">{lec.completed ? 'Yes' : 'No'}</TableCell>
                            <TableCell align="center">{`${toTime(lec.watchedSec)} / ${toTime(lec.durationSec)}`}</TableCell>
                            <TableCell align="center">
                              <Chip
                                label={typeof lec.seekCount === 'number' ? lec.seekCount : 0}
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="center">{toTime(lec.lastPositionSec)}</TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Box>
        ) : (
          <Typography color="text.secondary">No progress available</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>

      {selectedLectureId && (
        <LectureProgressModal
          open={openLectureModal}
          onClose={() => setOpenLectureModal(false)}
          userId={userId}
          lectureId={selectedLectureId}
        />
      )}
    </Dialog>
  );
}
