import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { Menu, MenuItem } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { useResources } from 'src/hooks/use-resources';
import { DashboardContent } from 'src/layouts/dashboard';
import { fDate } from 'src/utils/format-time';

import { TableEmptyRows } from '../user/table-empty-rows';
import { emptyRows } from '../user/utils';
import { ResourcesTableHead } from './resources-table-head';
import { AddResourceModal } from './view/AddResourceModal';
import { EditResourceBatchesModal } from './view/EditResourceBatchesModal';

// ----------------------------------------------------------------------

export default function ResourcesView() {
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState('title');
  const [selected, setSelected] = useState<string[]>([]);
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [openModal, setOpenModal] = useState(false);
  const [addResourceError, setAddResourceError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<string | null>(null);
  const [editBatchesModalOpen, setEditBatchesModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<{ id: string; batchIds: string[] } | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedResourceForMenu, setSelectedResourceForMenu] = useState<string | null>(null);

  const {
    resources,
    total,
    loading,
    error,
    addResource,
    addResourceLoading,
    addResourceError: hookAddResourceError,
    deleteResource,
    deleteResourceLoading,
    deleteResourceError,
    updateResourceBatches,
    updateBatchesLoading,
    updateBatchesError,
    fetchResources,
  } = useResources(page, rowsPerPage);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleOpenModal = () => {
    setAddResourceError(null);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setPage(0);
    setAddResourceError(null);
  };

  const handleDeleteClick = (resourceId: string) => {
    setResourceToDelete(resourceId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (resourceToDelete) {
      const success = await deleteResource(resourceToDelete);
      if (success) {
        await fetchResources();
      }
    }
    setDeleteConfirmOpen(false);
    setResourceToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setResourceToDelete(null);
  };

  const handleAddResource = async (data: {
    title: string;
    description: string;
    fileType: string;
    file: File;
    batchIds: string[];
  }) => {
    const success = await addResource(data);
    if (success) {
      setPage(0);
      await fetchResources();
      handleCloseModal();
    }
    return success;
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
        setSelected(resources.map((resource) => resource._id));
        return;
      }
      setSelected([]);
    },
    [resources]
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

  const filteredResources = resources.filter((resource) =>
    resource.title.toLowerCase().includes(filterName.toLowerCase())
  );

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, resourceId: string) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedResourceForMenu(resourceId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedResourceForMenu(null);
  };

  const handleEditBatchesClick = (resource: any) => {
    setSelectedResource({
      id: resource._id,
      batchIds: resource.batchIds || [],
    });
    setEditBatchesModalOpen(true);
    handleMenuClose();
  };

  const handleUpdateResourceBatches = async (data: { resourceId: string; batchIds: string[] }) => {
    const success = await updateResourceBatches(data);
    if (success) {
      setEditBatchesModalOpen(false);
      setSelectedResource(null);
    }
    return success;
  };

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
          Resources
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleOpenModal}
        >
          New Resource
        </Button>
      </Box>

      <Card>
        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <ResourcesTableHead
                order={order}
                orderBy={orderBy}
                rowCount={resources.length}
                numSelected={selected.length}
                onSort={handleSort}
                onSelectAllRows={handleSelectAllRows}
              />

              <TableBody>
                {filteredResources.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        <Iconify icon="mdi:file-document-outline" sx={{ fontSize: 40, color: 'text.disabled' }} />
                        <Typography variant="h6" color="text.secondary">
                          No Resources Found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Get started by adding a new resource
                        </Typography>
                      
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResources
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((resource) => (
                      <TableRow hover key={resource._id} selected={selected.includes(resource._id)}>
                        <TableCell padding="checkbox">
                          <Checkbox checked={selected.includes(resource._id)} onClick={() => handleSelectRow(resource._id)} />
                        </TableCell>

                        <TableCell>
                          <Typography variant="subtitle2">{resource.title}</Typography>
                        </TableCell>

                        <TableCell>{resource.description}</TableCell>

                        <TableCell>{resource.fileName}</TableCell>

                        <TableCell>{resource.fileType}</TableCell>

                        <TableCell>{fDate(resource.createdAt)}</TableCell>

                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, resource._id)}
                          >
                            <Iconify icon="eva:more-vertical-fill" />
                          </IconButton>
                          <Menu
                            anchorEl={menuAnchorEl}
                            open={Boolean(menuAnchorEl) && selectedResourceForMenu === resource._id}
                            onClose={handleMenuClose}
                          >
                            <MenuItem
                              onClick={() => handleEditBatchesClick(resource)}
                              sx={{ color: 'info.main' }}
                            >
                              <Iconify icon="solar:pen-bold" sx={{ mr: 1 }} />
                              Edit Batches
                            </MenuItem>
                            <MenuItem
                              onClick={() => {
                                handleDeleteClick(resource._id);
                                handleMenuClose();
                              }}
                              sx={{ color: 'error.main' }}
                            >
                              <Iconify icon="solar:trash-bin-trash-bold" sx={{ mr: 1 }} />
                              Delete
                            </MenuItem>
                          </Menu>
                        </TableCell>
                      </TableRow>
                    ))
                )}

                <TableEmptyRows
                  height={68}
                  emptyRows={emptyRows(page, rowsPerPage, resources.length)}
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

      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={handleDeleteCancel}
        title="Delete Resource"
        content="Are you sure you want to delete this resource? This action cannot be undone."
        action={
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            disabled={deleteResourceLoading}
          >
            Delete
          </Button>
        }
      />

      <AddResourceModal
        open={openModal}
        onClose={handleCloseModal}
        onSubmit={handleAddResource}
        loading={addResourceLoading}
        error={addResourceError}
      />

      {selectedResource && (
        <EditResourceBatchesModal
          open={editBatchesModalOpen}
          onClose={() => {
            setEditBatchesModalOpen(false);
            setSelectedResource(null);
          }}
          onSubmit={handleUpdateResourceBatches}
          loading={updateBatchesLoading}
          error={updateBatchesError}
          resourceId={selectedResource.id}
          currentBatchIds={selectedResource.batchIds}
        />
      )}
    </DashboardContent>
  );
} 