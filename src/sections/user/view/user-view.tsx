import { useState, useCallback, useEffect, useRef, useMemo } from 'react';

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
import { useBatches } from 'src/hooks/use-batches';
import { DashboardContent } from 'src/layouts/dashboard';
import httpService from 'src/services/httpService';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import type { UserProps } from '../user-table-row';

import { TableEmptyRows } from '../table-empty-rows';
import { TableNoData } from '../table-no-data';
import { UserTableHead } from '../user-table-head';
import { UserTableRow } from '../user-table-row';
import { UserTableToolbar } from '../user-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';
import { AddUserModal } from './AddUserModal';
import { BatchFilterModal } from './BatchFilterModal';
import { BulkHardwareResetModal } from './BulkHardwareResetModal';

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

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
    []
  );

  return [debouncedCallback, cancel];
}

export function UserView() {
  const table = useTable();
  const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>([]);
  const [noBatchOnly, setNoBatchOnly] = useState(false);

  // Use selectedBatchIds directly - no need for memoization
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
  } = useUsers(table.page, table.rowsPerPage, selectedBatchIds, noBatchOnly);

  const { batches } = useBatches(0, 100); // Get batches for name mapping

  const [filterName, setFilterName] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [updateUserLoading, setUpdateUserLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [openBatchFilter, setOpenBatchFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openBulkHardwareReset, setOpenBulkHardwareReset] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleOpenBatchFilter = () => setOpenBatchFilter(true);
  const handleCloseBatchFilter = () => setOpenBatchFilter(false);

  const handleOpenBulkHardwareReset = () => setOpenBulkHardwareReset(true);
  const handleCloseBulkHardwareReset = () => setOpenBulkHardwareReset(false);

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleBulkHardwareResetSuccess = () => {
    setSnackbar({
      open: true,
      message: 'Hardware IDs have been successfully reset for all users!',
      severity: 'success',
    });
  };

  const handleApplyBatchFilter = async (batchIds: string[]) => {
    setSelectedBatchIds(batchIds);
    table.onResetPage(); // Reset to first page when applying filter
  };

  const handleClearBatchFilter = () => {
    setSelectedBatchIds([]);
    table.onResetPage();
  };

  const handleToggleNoBatch = async (checked: boolean) => {
    setNoBatchOnly(checked);
    table.onResetPage();
  };

  // Get batch names for selected batch IDs
  const selectedBatchNames = selectedBatchIds.map((id) => {
    const batch = batches.find((b) => b._id === id);
    return batch ? batch.title : id;
  });

  // Update search query and trigger API search
  // Use the debounce hook you already have for the search functionality
  // Increase debounce time for search
  const [debouncedSearch, cancelSearch] = useDebounce(async (value: string) => {
    // If search query is empty or less than 2 characters, show all users
    if (!value || value.length < 2) {
      await fetchUsers(0, selectedBatchIds);
      return;
    }

    // If search query is 2 characters, filter local users only
    if (value.length === 2) {
      const localMatches = users.filter(
        (user) =>
          user.email.toLowerCase().includes(value.toLowerCase()) ||
          user.name.toLowerCase().includes(value.toLowerCase())
      );
      setUsers(localMatches);
      setTotal(localMatches.length);
      return;
    }

    // For 3+ character searches, use a local cache to avoid redundant API calls
    const searchCacheKey = `search-${value}`;
    const cachedSearchResults = sessionStorage.getItem(searchCacheKey);

    if (cachedSearchResults) {
      const parsedResults = JSON.parse(cachedSearchResults);
      setUsers(parsedResults.users);
      setTotal(parsedResults.total);
      return;
    }

    // If no cache hit, proceed with API call
    setSearchLoading(true);
    try {
      const response = await httpService.get<SearchResponse>(
        `/users/admin/find-student?email=${encodeURIComponent(value)}`
      );
      const searchResults = response.data.data;

      // Process results as before...
      const mappedApiUsers = searchResults.map((user) => ({
        ...user,
        status: user.isAccountActive ? 'Active' : 'Blocked',
        cnicBackImage: null,
        cnicFrontImage: null,
        backCNICURL: null,
        frontCNICURL: null,
      }));

      // Get local matches and combine with API results
      const localMatches = users
        .filter(
          (user) =>
            user.email.toLowerCase().includes(value.toLowerCase()) ||
            user.name.toLowerCase().includes(value.toLowerCase())
        )
        .map((user) => ({
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
      localMatches.forEach((localUser) => {
        if (!combinedUsers.some((apiUser) => apiUser._id === localUser._id)) {
          combinedUsers.push(localUser);
        }
      });

      // Cache the search results
      sessionStorage.setItem(
        searchCacheKey,
        JSON.stringify({
          users: combinedUsers,
          total: combinedUsers.length,
          timestamp: Date.now(),
        })
      );

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
  }, 1000); // Increase debounce time to 1000ms

  // Then update your handleFilterName function
  const handleFilterName = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFilterName(value);
    setSearchQuery(value);
    table.onResetPage();

    // Use the debounced search
    debouncedSearch(value);
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
    permissions: user.permissions || [],
  }));

  const notFound = !dataFiltered.length && !!filterName && !searchLoading;

  const handleDeleteUser = async (userId: string) => {
    await deleteUser(userId);
  };

  const handleBlockUser = async (userId: string) => {
    await blockUser(userId);
  };

  const handleUnblockUser = async (userId: string) => {
    await unblockUser(userId);
  };

  const handleResetHardwareIds = async (userId: string, data: any) => {
    await resetHardwareIds(userId, data);
  };

  const handleVerificationChange = async (userId: string, verified: boolean) => {
    await toggleIdVerification(userId);
  };

  const handleUpdateUser = async (userId: string, data: any) => {
    setUpdateUserLoading(true);
    try {
      await updateUser(userId, data);
    } finally {
      setUpdateUserLoading(false);
    }
  };

  const handleChangePage = useCallback(
    (event: unknown, newPage: number) => {
      table.onChangePage(event, newPage);
    },
    [table]
  );

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      table.onChangeRowsPerPage(event);
    },
    [table]
  );

  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>
          Users
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            color="warning"
            startIcon={<Iconify icon="solar:refresh-bold" />}
            onClick={handleOpenBulkHardwareReset}
          >
            Bulk Hardware Reset
          </Button>
          <Button
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={handleOpenModal}
          >
            New Users
          </Button>
        </Box>
      </Box>

      <Card>
        <UserTableToolbar
          numSelected={table.selected.length}
          filterName={filterName}
          onFilterName={handleFilterName}
          searchLoading={searchLoading}
          onBatchFilterClick={handleOpenBatchFilter}
          selectedBatchIds={selectedBatchIds}
          batchNames={selectedBatchNames}
          onClearBatchFilter={handleClearBatchFilter}
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
                    { id: 'progress', label: 'Progress' },
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

      <AddUserModal open={openModal} onClose={handleCloseModal} onUsersAdded={() => {}} />

      <BatchFilterModal
        open={openBatchFilter}
        onClose={handleCloseBatchFilter}
        onApplyFilter={(batchIds, noBatch) => {
          handleApplyBatchFilter(batchIds);
          handleToggleNoBatch(noBatch);
        }}
        selectedBatchIds={selectedBatchIds}
        noBatchOnly={noBatchOnly}
      />

      <BulkHardwareResetModal
        open={openBulkHardwareReset}
        onClose={handleCloseBulkHardwareReset}
        onSuccess={handleBulkHardwareResetSuccess}
      />

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

function useTable() {
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
