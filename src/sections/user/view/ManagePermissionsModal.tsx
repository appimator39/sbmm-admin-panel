import { useEffect, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { Iconify } from 'src/components/iconify';
import httpService from 'src/services/httpService';

type CatalogItem = { key: string; module: string; label: string };

interface ManagePermissionsModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  currentRole?: 'admin' | 'instructor' | 'user';
  currentPermissions?: string[];
}

export function ManagePermissionsModal({ open, onClose, userId, currentRole, currentPermissions }: ManagePermissionsModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [role, setRole] = useState<'admin' | 'instructor' | 'user'>(currentRole || 'user');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>(
    { open: false, message: '', severity: 'success' }
  );

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    (async () => {
      try {
        const res = await httpService.get<{ data: { permissions: string[]; catalog: CatalogItem[] } }>("/auth/all-permissions");
        setCatalog(res.data.data.catalog);
      } catch (err: any) {
        if (err.response?.status === 404) {
          try {
            const alt = await httpService.get<{ data: { permissions: string[]; catalog: CatalogItem[] } }>("/api/auth/all-permissions");
            setCatalog(alt.data.data.catalog);
          } catch (err2: any) {
            setSnackbar({ open: true, message: err2.response?.data?.message || 'Failed to load permissions', severity: 'error' });
          }
        } else {
          setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to load permissions', severity: 'error' });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [open]);

  const grouped = useMemo(() => {
    const map: Record<string, CatalogItem[]> = {};
    catalog.forEach((c) => {
      if (!map[c.module]) map[c.module] = [];
      map[c.module].push(c);
    });
    return map;
  }, [catalog]);

  const toggle = (key: string) => {
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const selectedKeys = useMemo(() => Object.keys(selected).filter((k) => selected[k]), [selected]);

  useEffect(() => {
    if (!open) return;
    if (!currentPermissions || currentPermissions.length === 0) return;
    const next: Record<string, boolean> = {};
    currentPermissions.forEach((key) => {
      next[key] = true;
    });
    setSelected(next);
  }, [open, currentPermissions]);

  const handleAssign = async () => {
    if (!selectedKeys.length) return;
    setSaving(true);
    try {
      try {
        await httpService.patch(`/users/super-admin/assign-permissions/${userId}`, { permissions: selectedKeys, role });
      } catch (err: any) {
        if (err.response?.status === 404) {
          await httpService.patch(`/api/users/super-admin/assign-permissions/${userId}`, { permissions: selectedKeys, role });
        } else {
          throw err;
        }
      }
      setSnackbar({ open: true, message: 'Permissions assigned successfully', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to assign permissions', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleRevoke = async () => {
    if (!selectedKeys.length) return;
    setSaving(true);
    try {
      try {
        await httpService.patch(`/users/super-admin/revoke-permissions/${userId}`, { permissions: selectedKeys, role });
      } catch (err: any) {
        if (err.response?.status === 404) {
          await httpService.patch(`/api/users/super-admin/revoke-permissions/${userId}`, { permissions: selectedKeys, role });
        } else {
          throw err;
        }
      }
      setSnackbar({ open: true, message: 'Permissions revoked successfully', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to revoke permissions', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleSetRole = async () => {
    setSaving(true);
    try {
      try {
        await httpService.patch(`/users/admin/set-role/${userId}`, { role });
      } catch (err: any) {
        if (err.response?.status === 404) {
          await httpService.patch(`/api/users/admin/set-role/${userId}`, { role });
        } else {
          throw err;
        }
      }
      setSnackbar({ open: true, message: 'Role updated successfully', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to update role', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSnackbar = () => setSnackbar((s) => ({ ...s, open: false }));

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Manage Roles & Permissions
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
          >
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3}>
            <Box display="flex" gap={2} alignItems="center">
              <TextField
                select
                label="Role"
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                sx={{ minWidth: 220 }}
                disabled={currentRole === 'admin'}
                helperText={currentRole === 'admin' ? 'Super Admin: full access' : undefined}
              >
                <MenuItem value="instructor">Instructor</MenuItem>
                <MenuItem value="user">User</MenuItem>
              </TextField>
              <Button
                variant="outlined"
                onClick={handleSetRole}
                disabled={saving || currentRole === 'admin'}
                startIcon={saving ? <CircularProgress size={18} /> : null}
              >
                Update Role
              </Button>
            </Box>
            <Divider />
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height={200}>
                <CircularProgress />
              </Box>
            ) : (
              <Stack spacing={2}>
                {Object.keys(grouped).map((moduleKey) => (
                  <Box key={moduleKey}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>{moduleKey}</Typography>
                    <Stack direction="row" flexWrap="wrap" gap={2}>
                      {grouped[moduleKey].map((item) => (
                        <FormControlLabel
                          key={item.key}
                          control={<Checkbox checked={!!selected[item.key]} onChange={() => toggle(item.key)} />}
                          label={item.label}
                        />
                      ))}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={onClose}>Close</Button>
          <Button variant="contained" color="warning" onClick={handleRevoke} disabled={saving || !selectedKeys.length}>
            Revoke Selected
          </Button>
          <Button variant="contained" onClick={handleAssign} disabled={saving || !selectedKeys.length}>
            Assign Selected
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
