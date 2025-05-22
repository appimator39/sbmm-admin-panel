import { useState, useCallback, useEffect, useRef } from 'react';

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
import httpService from 'src/services/httpService';

import type { UserProps } from '../user-table-row';

import { TableEmptyRows } from '../table-empty-rows';
import { TableNoData } from '../table-no-data';
import { UserTableHead } from '../user-table-head';
import { UserTableRow } from '../user-table-row';
import { UserTableToolbar } from '../user-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';
import { AddUserModal } from './AddUserModal';
import { BatchFilterModal } from './BatchFilterModal';

// ----------------------------------------------------------------------

interface UsersResponse {
  statusCode: number;
  message: string;
  data: {
    users: UserProps[];
    total: number;
  };
}

interface SearchResponse {
  statusCode: number;
  message: string;
  data: {
    _id: string;
    name: string;
    fatherName: string;
    gender: string;
    phoneNumber: string;
    whatsapp: string;
    idVerified: boolean;
    hardwareIdWindows: string | null;
    hardwareIdAndroid: string | null;
    hardwareIdMac: string | null;
    hardwareIdIOS: string | null;
    rollNo: string;
    facebookProfileUrl: string;
    address: string;
    isAccountActive: boolean;
    isVerified: boolean;
    notice: string;
    email: string;
    avatar: string;
    role: string;
    batches: { title: string }[];
    createdAt: string;
    updatedAt: string;
  }[];
}

// Simple debounce function
function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): [(...args: Parameters<T>) => void, () => void] {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  useEffect(() => () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return [debouncedCallback, cancel];
}

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
  const [openBatchFilter, setOpenBatchFilter] = useState(false);
  const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleOpenBatchFilter = () => setOpenBatchFilter(true);
  const handleCloseBatchFilter = () => setOpenBatchFilter(false);

  const handleApplyBatchFilter = async (batchIds: string[]) => {
    setSelectedBatchIds(batchIds);
    await fetchUsers(table.page, batchIds);
  };

  // Update search query and trigger API search
  const handleFilterName = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFilterName(value);
    setSearchQuery(value);
    table.onResetPage();

    // If search query is less than 2 characters, show all users
    if (value.length < 2) {
      await fetchUsers(table.page, selectedBatchIds);
      return;
    }

    // If search query is 2 characters, filter local users
    if (value.length === 2) {
      const localMatches = users.filter(user => 
        user.email.toLowerCase().includes(value.toLowerCase()) ||
        user.name.toLowerCase().includes(value.toLowerCase())
      );
      setUsers(localMatches);
      setTotal(localMatches.length);
      return;
    }

    // If search query is 3 or more characters, search API
    setSearchLoading(true);
    try {
      const response = await httpService.get<SearchResponse>(`/users/admin/find-student?email=${encodeURIComponent(value)}`);
      const searchResults = response.data.data;
      
      // Map the search results to include all required User type fields
      const mappedApiUsers = searchResults.map(user => ({
        ...user,
        status: user.isAccountActive ? 'Active' : 'Blocked',
        cnicBackImage: null,
        cnicFrontImage: null,
        backCNICURL: null,
        frontCNICURL: null,
      }));

      // Get local matches and map them to match API format
      const localMatches = users
        .filter(user => 
          user.email.toLowerCase().includes(value.toLowerCase()) ||
          user.name.toLowerCase().includes(value.toLowerCase())
        )
        .map(user => ({
          ...user,
          notice: '',
          status: user.isAccountActive ? 'Active' : 'Blocked',
          cnicBackImage: null,
          cnicFrontImage: null,
          backCNICURL: null,
          frontCNICURL: null,
        }));

      // Combine API results with local matches, removing duplicates
      const combinedUsers = [...mappedApiUsers];
      localMatches.forEach(localUser => {
        if (!combinedUsers.some(apiUser => apiUser._id === localUser._id)) {
          combinedUsers.push(localUser);
        }
      });

      setUsers(combinedUsers);
      setTotal(combinedUsers.length);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to search students');
      setUsers([]);
      setTotal(0);
    } finally {
      setSearchLoading(false);
    }
  };

  const dataFiltered = users.map((user) => ({
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
  }));

  const notFound = !dataFiltered.length && !!filterName && !searchLoading;

  const handleDeleteUser = async (userId: string) => {
    await deleteUser(userId);
    await fetchUsers(table.page, selectedBatchIds);
  };

  const handleBlockUser = async (userId: string) => {
    await blockUser(userId);
    await fetchUsers(table.page, selectedBatchIds);
  };

  const handleUnblockUser = async (userId: string) => {
    await unblockUser(userId);
    await fetchUsers(table.page, selectedBatchIds);
  };

  const handleResetHardwareIds = async (userId: string, data: any) => {
    await resetHardwareIds(userId, data);
    await fetchUsers(table.page, selectedBatchIds);
  };

  const handleVerificationChange = async (userId: string, verified: boolean) => {
    await toggleIdVerification(userId);
    await fetchUsers(table.page, selectedBatchIds);
  };

  const handleUpdateUser = async (userId: string, data: any) => {
    setUpdateUserLoading(true);
    try {
      await updateUser(userId, data);
    } finally {
      setUpdateUserLoading(false);
    }
  };

  const handleChangePage = useCallback((event: unknown, newPage: number) => {
    table.onChangePage(event, newPage);
    fetchUsers(newPage, selectedBatchIds);
  }, [table, fetchUsers, selectedBatchIds]);

  const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    table.onChangeRowsPerPage(event);
    fetchUsers(0, selectedBatchIds);
  }, [table, fetchUsers, selectedBatchIds]);

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
          onBatchFilterClick={handleOpenBatchFilter}
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
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      <AddUserModal 
        open={openModal} 
        onClose={handleCloseModal} 
        onUsersAdded={() => fetchUsers(table.page, selectedBatchIds)}
      />

      <BatchFilterModal
        open={openBatchFilter}
        onClose={handleCloseBatchFilter}
        onApplyFilter={handleApplyBatchFilter}
        selectedBatchIds={selectedBatchIds}
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
