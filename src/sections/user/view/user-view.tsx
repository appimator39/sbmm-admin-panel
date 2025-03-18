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
import { useUsers } from 'src/hooks/use-users';
import { DashboardContent } from 'src/layouts/dashboard';

import type { UserProps } from '../user-table-row';

import { TableEmptyRows } from '../table-empty-rows';
import { TableNoData } from '../table-no-data';
import { UserTableHead } from '../user-table-head';
import { UserTableRow } from '../user-table-row';
import { UserTableToolbar } from '../user-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';
import { AddUserModal } from './AddUserModal';

// ----------------------------------------------------------------------

export function UserView() {
  const table = useTable();
  const { 
    users, 
    total, 
    loading, 
    error, 
    deleteUser, 
    blockUser, 
    unblockUser, 
    resetHardwareIds,
    blockUserLoading,
    blockUserError,
    resetHardwareError,
    deleteUserError,
    fetchUsers,
    toggleIdVerification,
    updateUser,
    findStudentByEmail,
    searchUsers,
    setUsers,
    setTotal,
    setError,
  } = useUsers(table.page, table.rowsPerPage);

  const [filterName, setFilterName] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [updateUserLoading, setUpdateUserLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleFilterName = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFilterName(value);
    table.onResetPage();

    if (!value) {
      await fetchUsers(table.page);
      return;
    }

    // First check if we have a match in local users
    const localMatch = users.find(user => 
      user.email.toLowerCase().includes(value.toLowerCase())
    );

    if (localMatch) {
      setSearchLoading(false);
      setError(null);
      return;
    }

    // If no local match and it's a complete email, try API
    const isCompleteEmail = value.includes('@') && value.includes('.');
    
    if (isCompleteEmail) {
      setSearchLoading(true);
      try {
        // Try to find the exact email
        const student = await findStudentByEmail(value);
        if (student) {
          setUsers([student]);
          setTotal(1);
          setError(null);
          return;
        }
      } catch (err) {
        // If not found, continue with normal search
      }

      try {
        const searchResults = await searchUsers(value);
        setUsers(searchResults);
        setTotal(searchResults.length);
        setError(null);
      } catch (err) {
        setError(err.message);
        setUsers([]);
        setTotal(0);
      } finally {
        setSearchLoading(false);
      }
    } else {
      // For incomplete email, just filter the existing users
      setSearchLoading(false);
      setError(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    await deleteUser(userId);
    await fetchUsers(table.page);
  };

  const handleBlockUser = async (userId: string) => {
    await blockUser(userId);
    await fetchUsers(table.page);
  };

  const handleUnblockUser = async (userId: string) => {
    await unblockUser(userId);
    await fetchUsers(table.page);
  };

  const handleResetHardwareIds = async (userId: string, data: any) => {
    await resetHardwareIds(userId, data);
    await fetchUsers(table.page);
  };

  const handleVerificationChange = async (userId: string, verified: boolean) => {
    await toggleIdVerification(userId);
    await fetchUsers(table.page);
  };

  const handleUpdateUser = async (userId: string, data: any) => {
    setUpdateUserLoading(true);
    try {
      await updateUser(userId, data);
    } finally {
      setUpdateUserLoading(false);
    }
  };

  const dataFiltered: UserProps[] = applyFilter({
    inputData: users.map((user) => ({
      ...user,
      id: user._id,
      _id: user._id,
      email: user.email,
      role: user.role || '',
      batch: user.batches.map((batch) => batch.title).join(', '),
      status: user.isAccountActive ? 'Active' : 'Blocked',
      avatarUrl: user.avatar || '',
      company: user.email || '',
      fatherName: user.fatherName || '',
      gender: user.gender || '',
      phoneNumber: user.phoneNumber || '',
      whatsapp: user.whatsapp || '',
      rollNo: user.rollNo || '',
      facebookProfileUrl: user.facebookProfileUrl || '',
      address: user.address || '',
    })),
    comparator: getComparator(table.order, table.orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName && !searchLoading;

  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>
          Users
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleOpenModal}
        >
          New Users
        </Button>
      </Box>

      <Card>
        <UserTableToolbar
          numSelected={table.selected.length}
          filterName={filterName}
          onFilterName={handleFilterName}
          searchLoading={searchLoading}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height={400}>
                <CircularProgress />
              </Box>
            ) : (
              <Table sx={{ minWidth: 800 }}>
                <UserTableHead
                  order={table.order}
                  orderBy={table.orderBy}
                  rowCount={users.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      users.map((user) => user._id)
                    )
                  }
                  headLabel={[
                    { id: 'name', label: 'Name' },
                    { id: 'email', label: 'Email' },
                    { id: 'batches', label: 'Batch' },
                    { id: 'isVerified', label: 'Verified', align: 'center' },
                    { id: 'isAccountActive', label: 'Status' },
                    { id: '' },
                  ]}
                />
                <TableBody>
                  {dataFiltered.map((row) => (
                    <UserTableRow
                      key={row.id}
                      row={row}
                      selected={table.selected.includes(row.id)}
                      onSelectRow={() => table.onSelectRow(row.id)}
                      onDeleteUser={handleDeleteUser}
                      onBlockUser={handleBlockUser}
                      onUnblockUser={handleUnblockUser}
                      onResetHardwareIds={handleResetHardwareIds}
                      onVerificationChange={handleVerificationChange}
                      onUpdateUser={handleUpdateUser}
                      blockUserLoading={blockUserLoading}
                      blockUserError={blockUserError}
                      resetHardwareError={resetHardwareError}
                      deleteUserError={deleteUserError}
                      updateUserLoading={updateUserLoading}
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
          page={table.page}
          count={total}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>

      <AddUserModal 
        open={openModal} 
        onClose={handleCloseModal} 
        onUsersAdded={() => fetchUsers(table.page)}
      />
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

export function useTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('name');
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [selected, setSelected] = useState<string[]>([]);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const onSort = useCallback(
    (id: string) => {
      const isAsc = orderBy === id && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    },
    [order, orderBy]
  );

  const onSelectAllRows = useCallback((checked: boolean, newSelecteds: string[]) => {
    if (checked) {
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  }, []);

  const onSelectRow = useCallback(
    (inputValue: string) => {
      const newSelected = selected.includes(inputValue)
        ? selected.filter((value) => value !== inputValue)
        : [...selected, inputValue];

      setSelected(newSelected);
    },
    [selected]
  );

  const onResetPage = useCallback(() => {
    setPage(0);
  }, []);

  const onChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const onChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      onResetPage();
    },
    [onResetPage]
  );

  return {
    page,
    order,
    onSort,
    orderBy,
    selected,
    rowsPerPage,
    onSelectRow,
    onResetPage,
    onChangePage,
    onSelectAllRows,
    onChangeRowsPerPage,
  };
}
