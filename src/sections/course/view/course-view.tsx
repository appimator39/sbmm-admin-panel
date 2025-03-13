import { useState, useCallback } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import Typography from '@mui/material/Typography';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { useCourses } from 'src/hooks/use-courses';
import { DashboardContent } from 'src/layouts/dashboard';

import { TableEmptyRows } from '../../user/table-empty-rows';
import { emptyRows } from '../../user/utils';
import { CourseTableHead } from '../course-table-head';
import CourseTableRow from '../course-table-row';
import { AddCourseModal } from './AddCourseModal';

// ----------------------------------------------------------------------

export function CourseView() {
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState('title');
  const [selected, setSelected] = useState<string[]>([]);
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [openModal, setOpenModal] = useState(false);

  const {
    courses,
    total,
    loading,
    error,
    addCourse,
    addCourseLoading,
    addCourseError,
    deleteCourse,
    deleteCourseLoading,
    deleteCourseError,
    togglePublish,
    togglePublishLoading,
    togglePublishError,
    fetchCourses,
  } = useCourses(page, rowsPerPage);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => {
    setOpenModal(false);
    setPage(0);
  };

  const handleAddCourse = async (data: {
    title: string;
    description: string;
    thumbnail: string;
    category: string[];
    tags: string[];
    isPublished: boolean;
    isFree: boolean;
  }) => {
    const success = await addCourse(data);
    if (success) {
      setPage(0);
      await fetchCourses(0);
      handleCloseModal();
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    const success = await deleteCourse(courseId);
    if (success) {
      await fetchCourses(page);
    }
  };

  const handleTogglePublish = async (courseId: string) => {
    const success = await togglePublish(courseId);
    if (success) {
      await fetchCourses(page);
    }
  };

  const handleSort = useCallback(
    (id: string) => {
      const isAsc = orderBy === id && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    },
    [order, orderBy]
  );

  const handleSelectAllRows = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelected(courses.map((course) => course._id));
        return;
      }
      setSelected([]);
    },
    [courses]
  );

  const handleSelectRow = useCallback(
    (id: string) => {
      const selectedIndex = selected.indexOf(id);
      let newSelected: string[] = [];

      if (selectedIndex === -1) {
        newSelected = newSelected.concat(selected, id);
      } else if (selectedIndex === 0) {
        newSelected = newSelected.concat(selected.slice(1));
      } else if (selectedIndex === selected.length - 1) {
        newSelected = newSelected.concat(selected.slice(0, -1));
      } else if (selectedIndex > 0) {
        newSelected = newSelected.concat(
          selected.slice(0, selectedIndex),
          selected.slice(selectedIndex + 1)
        );
      }

      setSelected(newSelected);
    },
    [selected]
  );

  const handleChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(filterName.toLowerCase())
  );

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
          Courses
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleOpenModal}
        >
          New Course
        </Button>
      </Box>

      <Card>
        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <CourseTableHead
                order={order}
                orderBy={orderBy}
                rowCount={courses.length}
                numSelected={selected.length}
                onSort={handleSort}
                onSelectAllRows={handleSelectAllRows}
              />

              <TableBody>
                {filteredCourses
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((course) => (
                    <CourseTableRow
                      key={course._id}
                      row={{
                        id: course._id,
                        title: course.title,
                        students: course.students,
                        isPublished: course.isPublished,
                        createdAt: course.createdAt,
                      }}
                      selected={selected.includes(course._id)}
                      onSelectRow={() => handleSelectRow(course._id)}
                      onDeleteRow={() => handleDeleteCourse(course._id)}
                      onTogglePublish={() => handleTogglePublish(course._id)}
                      deleteLoading={deleteCourseLoading}
                      togglePublishLoading={togglePublishLoading}
                    />
                  ))}

                <TableEmptyRows
                  height={68}
                  emptyRows={emptyRows(page, rowsPerPage, courses.length)}
                />
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          component="div"
          page={page}
          count={total}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      <AddCourseModal
        open={openModal}
        onClose={handleCloseModal}
        onSubmit={handleAddCourse}
        loading={addCourseLoading}
        error={addCourseError}
      />
    </DashboardContent>
  );
}
