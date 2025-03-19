import { useState, useCallback } from 'react';

import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { useChapters } from 'src/hooks/use-chapters';
import { DashboardContent } from 'src/layouts/dashboard';

import { ChapterTableHead } from '../chapter-table-head';
import ChapterTableRow from '../chapter-table-row';
import { AddChapterModal } from './AddChapterModal';
import { AddLectureModal } from './AddLectureModal';

// ----------------------------------------------------------------------

interface GroupedChapter {
  courseId: string;
  courseTitle: string;
  chaptersCount: number;
  lecturesCount: number;
  createdAt: string;
  chapters: Array<{
    id: string;
    title: string;
    lecturesCount: number;
    createdAt: string;
  }>;
}

export function ChapterView() {
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState('title');
  const [selected, setSelected] = useState<string[]>([]);
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [openModal, setOpenModal] = useState(false);
  const [expandedCourse, setExpandedCourse] = useState<string | false>(false);
  const [selectedCourse, setSelectedCourse] = useState<{ id: string; title: string } | null>(null);
  const [openLectureModal, setOpenLectureModal] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<{ id: string; title: string } | null>(
    null
  );

  const {
    chapters,
    total,
    loading,
    error,
    addChapter,
    addChapterLoading,
    addChapterError,
    deleteChapter,
    deleteChapterLoading,
    deleteChapterError,
    togglePublish,
    togglePublishLoading,
    togglePublishError,
    fetchChapters,
    addLecture,
    addLectureLoading,
    addLectureError,
    deleteLecture,
    deleteLectureLoading,
  } = useChapters(page, rowsPerPage);

  const handleOpenModal = (courseId?: string, courseTitle?: string) => {
    if (courseId && courseTitle) {
      setSelectedCourse({ id: courseId, title: courseTitle });
    } else {
      setSelectedCourse(null);
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedCourse(null);
    setPage(0);
  };

  const handleAddChapter = async (data: {
    title: string;
    description: string;
    order: number;
    course: string;
  }) => {
    const success = await addChapter(data);
    if (success) {
      setPage(0);
      await fetchChapters(0);
      handleCloseModal();
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    const success = await deleteChapter(chapterId);
    if (success) {
      await fetchChapters(page);
    }
  };

  const handleChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handleFilterByName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterName(event.target.value);
  };

  const handleExpandCourse = (courseId: string) => {
    setExpandedCourse(expandedCourse === courseId ? false : courseId);
  };

  const handleOpenLectureModal = (chapterId: string, chapterTitle: string) => {
    setSelectedChapter({ id: chapterId, title: chapterTitle });
    setOpenLectureModal(true);
  };

  const handleCloseLectureModal = () => {
    setOpenLectureModal(false);
    setSelectedChapter(null);
  };

  const handleAddLecture = async (formData: FormData, config?: { onUploadProgress: (progressEvent: any) => void }) => {
    try {
      const success = await addLecture(formData, config);
      if (success) {
        handleCloseLectureModal();
        await fetchChapters(page);
      }
    } catch (err) {
      console.error('Error adding lecture:', err);
    }
  };

  // Group chapters by course
  const groupedChapters = chapters.reduce<GroupedChapter[]>((acc, chapter) => {
    const existingGroup = acc.find((group) => group.courseId === chapter.course._id);

    if (existingGroup) {
      existingGroup.chaptersCount += 1;
      existingGroup.lecturesCount += chapter.lectures.length;
      existingGroup.chapters.push({
        id: chapter._id,
        title: chapter.title,
        lecturesCount: chapter.lectures.length,
        createdAt: chapter.createdAt,
      });
    } else {
      acc.push({
        courseId: chapter.course._id,
        courseTitle: chapter.course.title,
        chaptersCount: 1,
        lecturesCount: chapter.lectures.length,
        createdAt: chapter.course.createdAt,
        chapters: [
          {
            id: chapter._id,
            title: chapter.title,
            lecturesCount: chapter.lectures.length,
            createdAt: chapter.createdAt,
          },
        ],
      });
    }
    return acc;
  }, []);

  // Filter grouped chapters based on search term
  const filteredGroups = groupedChapters.filter((group) => {
    const matchCourse = group.courseTitle.toLowerCase().includes(filterName.toLowerCase());
    const matchChapters = group.chapters.some((chapter) =>
      chapter.title.toLowerCase().includes(filterName.toLowerCase())
    );
    return matchCourse || matchChapters;
  });

  if (loading) {
    return (
      <DashboardContent>
        <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
          <CircularProgress />
        </Box>
      </DashboardContent>
    );
  }

  if (error) {
    return (
      <DashboardContent>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>
          Chapters
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => handleOpenModal()}
        >
          New Chapter
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" sx={{ py: 2.5, px: 3 }}>
          <TextField
            value={filterName}
            onChange={handleFilterByName}
            placeholder="Search chapters..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />
        </Stack>
      </Card>

      <Card>
        <Scrollbar>
          {filteredGroups.map((group) => (
            <Accordion
              key={group.courseId}
              expanded={expandedCourse === group.courseId}
              onChange={() => handleExpandCourse(group.courseId)}
            >
              <AccordionSummary
                expandIcon={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal(group.courseId, group.courseTitle);
                      }}
                      sx={{ mr: 1 }}
                    >
                      <Iconify icon="mingcute:add-line" />
                    </IconButton>
                    <Iconify icon="eva:arrow-ios-downward-fill" />
                  </Box>
                }
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Typography sx={{ width: '30%', flexShrink: 0 }}>{group.courseTitle}</Typography>
                  <Typography sx={{ width: '20%' }}>{group.chaptersCount} Chapters</Typography>
                  <Typography sx={{ width: '20%' }}>{group.lecturesCount} Lectures</Typography>
                  <Typography sx={{ color: 'text.secondary' }}>
                    Created: {new Date(group.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer>
                  <Table>
                    <ChapterTableHead
                      order={order}
                      orderBy={orderBy}
                      rowCount={group.chapters.length}
                      numSelected={selected.length}
                      onSort={() => {}}
                      onSelectAllRows={() => {}}
                    />
                    <TableBody>
                      {group.chapters.map((chapter) => (
                        <ChapterTableRow
                          key={chapter.id}
                          row={{
                            id: chapter.id,
                            title: chapter.title,
                            lecturesCount: chapter.lecturesCount,
                            courseTitle: group.courseTitle,
                            createdAt: chapter.createdAt,
                            lectures: chapters.find((c) => c._id === chapter.id)?.lectures || [],
                          }}
                          selected={selected.includes(chapter.id)}
                          onSelectRow={() => {}}
                          onDeleteRow={() => handleDeleteChapter(chapter.id)}
                          onAddLecture={() => handleOpenLectureModal(chapter.id, chapter.title)}
                          onDeleteLecture={async (lectureId) => {
                            const success = await deleteLecture(lectureId);
                            if (success) {
                              await fetchChapters(page);
                            }
                          }}
                          deleteLoading={deleteChapterLoading}
                          togglePublishLoading={togglePublishLoading}
                          deleteLectureLoading={deleteLectureLoading}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          ))}
        </Scrollbar>
      </Card>

      <AddChapterModal
        open={openModal}
        onClose={handleCloseModal}
        onSubmit={handleAddChapter}
        loading={addChapterLoading}
        error={addChapterError}
        courseId={selectedCourse?.id}
        courseTitle={selectedCourse?.title}
      />

      <AddLectureModal
        open={openLectureModal}
        onClose={handleCloseLectureModal}
        onSubmit={handleAddLecture}
        loading={addLectureLoading}
        error={addLectureError}
        chapterId={selectedChapter?.id || ''}
        chapterTitle={selectedChapter?.title || ''}
      />
    </DashboardContent>
  );
}
