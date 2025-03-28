import { useState, useCallback } from 'react';

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
import { useBatches } from 'src/hooks/use-batches';
import { useUsers } from 'src/hooks/use-users';
import { DashboardContent } from 'src/layouts/dashboard';

import { TableEmptyRows } from '../../user/table-empty-rows';
import { emptyRows } from '../../user/utils';
import { BatchTableHead } from '../batch-table-head';
import BatchTableRow from '../batch-table-row';
import { BatchTableToolbar } from '../batch-table-toolbar';
import { AddBatchModal } from './AddBatchModal';

interface Batch {
  _id: string;
  title: string;
  description: string;
  students: string[];
  courses: string[];
  createdAt: string;
}

// ----------------------------------------------------------------------

export function BatchView() {
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState('title');
  const [selected, setSelected] = useState<string[]>([]);
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [openModal, setOpenModal] = useState(false);

  const {
    batches,
    total,
    loading,
    error,
    addBatch,
    addBatchLoading,
    addBatchError,
    deleteBatch,
    deleteBatchLoading,
    deleteBatchError,
    fetchBatches,
    enrollStudents,
    assignCourses,
    removeStudent,
  } = useBatches(page, rowsPerPage);

  const { searchUsers } = useUsers(0, 25);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => {
    setOpenModal(false);
    setPage(0);
  };

  const handleAddBatch = async (data: { title: string; description: string }) => {
    const success = await addBatch(data);
    if (success) {
      setPage(0);
      await fetchBatches(0);
      handleCloseModal();
    }
  };

  const handleDeleteBatch = async (batchId: string) => {
    const success = await deleteBatch(batchId);
    if (success) {
      await fetchBatches(page);
    }
  };

  const handleEnrollStudents = async (batchId: string, emails: string[]) => {
    await enrollStudents(batchId, emails);
    await fetchBatches(page);
  };

  const handleAssignCourses = async (batchId: string, courseId: string) => {
    await assignCourses(batchId, courseId);
    await fetchBatches(page);
  };

  const handleSearchEmail = async (query: string) => {
    const users = await searchUsers(query);
    return users.map((user) => ({ email: user.email }));
  };

  const handleRemoveStudent = async (batchId: string, email: string) => {
    await removeStudent(batchId, email);
    await fetchBatches(page);
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
        setSelected(batches.map((batch) => batch._id));
        return;
      }
      setSelected([]);
    },
    [batches]
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

  const handleFilterName = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterName(event.target.value);
    setPage(0);
  }, []);

  const filteredBatches = batches.filter((batch) =>
    batch.title.toLowerCase().includes(filterName.toLowerCase())
  );

  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>
          Batches
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleOpenModal}
        >
          New Batch
        </Button>
      </Box>

      <Card>
        <BatchTableToolbar
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
                <BatchTableHead
                  order={order}
                  orderBy={orderBy}
                  rowCount={batches.length}
                  numSelected={selected.length}
                  onSort={handleSort}
                  onSelectAllRows={handleSelectAllRows}
                />

                <TableBody>
                  {filteredBatches
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((batch) => (
                      <BatchTableRow
                        key={batch._id}
                        row={{
                          id: batch._id,
                          title: batch.title,
                          description: batch.description,
                          students: batch.students,
                          courses: batch.courses,
                          createdAt: batch.createdAt,
                        }}
                        selected={selected.includes(batch._id)}
                        onSelectRow={() => handleSelectRow(batch._id)}
                        onDeleteRow={() => handleDeleteBatch(batch._id)}
                        deleteLoading={deleteBatchLoading}
                        onEnrollStudents={handleEnrollStudents}
                        onAssignCourses={handleAssignCourses}
                        onRemoveStudent={handleRemoveStudent}
                      />
                    ))}

                  <TableEmptyRows
                    height={68}
                    emptyRows={emptyRows(page, rowsPerPage, batches.length)}
                  />
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

      <AddBatchModal
        open={openModal}
        onClose={handleCloseModal}
        onSubmit={handleAddBatch}
        loading={addBatchLoading}
        error={addBatchError}
      />
    </DashboardContent>
  );
}
