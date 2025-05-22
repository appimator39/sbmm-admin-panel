import { useState, useCallback, useEffect } from 'react';

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
import { DashboardContent } from 'src/layouts/dashboard';
import httpService from 'src/services/httpService';
import { TableNoData } from '../../user/table-no-data';
import { Quiz } from '../types';
import { applyFilter, getComparator } from '../utils';
import { QuizTableToolbar } from '../quiz-table-toolbar';
import { QuizTableHead } from '../quiz-table-head';
import { AddQuizModal } from './AddQuizModal';
import { QuizTableRow } from '../quiz-table-row';

// ----------------------------------------------------------------------

interface QuizResponse {
  data: Quiz[];
  meta: {
    total: number;
    page: string;
    limit: string;
    totalPages: number;
  };
}

export function QuizView() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState('title');
  const [selected, setSelected] = useState<string[]>([]);
  const [filterName, setFilterName] = useState('');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const fetchQuizzes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await httpService.get<QuizResponse>(
        `/quiz/admin/all?page=${page + 1}&limit=${rowsPerPage}`
      );
      setQuizzes(response.data.data);
      setTotal(response.data.meta.total);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (id: string) => {
    const isAsc = orderBy === id && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(id);
  };

  const handleSelectAllRows = (checked: boolean) => {
    if (checked) {
      setSelected(quizzes.map((quiz) => quiz._id));
      return;
    }
    setSelected([]);
  };

  const handleSelectRow = (id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = [...selected, id];
    } else {
      newSelected = selected.filter((value) => value !== id);
    }

    setSelected(newSelected);
  };

  const handleFilterName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterName(event.target.value);
  };

  const handleDeleteQuiz = async (id: string) => {
    try {
      await httpService.delete(`/quiz/admin/${id}`);
      await fetchQuizzes();
    } catch (error) {
      console.error('Error deleting quiz:', error);
    }
  };

  const dataFiltered = applyFilter({
    inputData: quizzes,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>
          Quizzes
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleOpenModal}
        >
          New Quiz
        </Button>
      </Box>

      <Card>
        <QuizTableToolbar
          numSelected={selected.length}
          filterName={filterName}
          onFilterName={handleFilterName}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height={400}>
                <CircularProgress />
              </Box>
            ) : (
              <Table sx={{ minWidth: 800 }}>
                <QuizTableHead
                  order={order}
                  orderBy={orderBy}
                  rowCount={quizzes.length}
                  numSelected={selected.length}
                  onSort={handleSort}
                  onSelectAllRows={handleSelectAllRows}
                  headLabel={[
                    { id: 'title', label: 'Title' },
                    { id: 'topic', label: 'Topic' },
                    { id: 'batches', label: 'Batches' },
                    { id: 'totalMarks', label: 'Total Marks' },
                    { id: 'passingMarks', label: 'Passing Marks' },
                    { id: 'lastDateToSubmit', label: 'Last Date' },
                    { id: 'submissions', label: 'Submissions' },
                    { id: '', label: '' },
                  ]}
                />
                <TableBody>
                  {dataFiltered.map((row) => (
                    <QuizTableRow
                      key={row._id}
                      row={row}
                      selected={selected.includes(row._id)}
                      onSelectRow={() => handleSelectRow(row._id)}
                      onDeleteRow={() => handleDeleteQuiz(row._id)}
                    />
                  ))}

                  {notFound && <TableNoData searchQuery={filterName} />}
                </TableBody>
              </Table>
            )}
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

      <AddQuizModal 
        open={openModal} 
        onClose={handleCloseModal} 
        onQuizAdded={fetchQuizzes}
      />
    </DashboardContent>
  );
} 