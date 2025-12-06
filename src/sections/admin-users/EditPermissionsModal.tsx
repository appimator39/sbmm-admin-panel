import { useState, useEffect, useMemo } from 'react';

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
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import { Iconify } from 'src/components/iconify';

import type { AdminUser, PermissionCatalogItem } from 'src/hooks/use-admin-users';

interface EditPermissionsModalProps {
  open: boolean;
  onClose: () => void;
  adminUser: AdminUser | null;
  onSubmit: (userId: string, permissions: string[]) => Promise<void>;
  catalog: PermissionCatalogItem[];
  catalogLoading: boolean;
  loading: boolean;
  error: string | null;
}

export function EditPermissionsModal({
  open,
  onClose,
  adminUser,
  onSubmit,
  catalog,
  catalogLoading,
  loading,
  error,
}: EditPermissionsModalProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<Record<string, boolean>>({});

  // Initialize selected permissions from adminUser
  useEffect(() => {
    if (open && adminUser) {
      const initial: Record<string, boolean> = {};
      (adminUser.permissions || []).forEach((perm) => {
        initial[perm] = true;
      });
      setSelectedPermissions(initial);
    }
  }, [open, adminUser]);

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedPermissions({});
    }
  }, [open]);

  // Group permissions by module
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, PermissionCatalogItem[]> = {};
    catalog.forEach((item) => {
      if (!groups[item.module]) {
        groups[item.module] = [];
      }
      groups[item.module].push(item);
    });
    return groups;
  }, [catalog]);

  const togglePermission = (key: string) => {
    setSelectedPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleModulePermissions = (module: string, checked: boolean) => {
    const modulePermissions = groupedPermissions[module] || [];
    setSelectedPermissions((prev) => {
      const updated = { ...prev };
      modulePermissions.forEach((item) => {
        updated[item.key] = checked;
      });
      return updated;
    });
  };

  const isModuleFullySelected = (module: string) => {
    const modulePermissions = groupedPermissions[module] || [];
    return modulePermissions.every((item) => selectedPermissions[item.key]);
  };

  const isModulePartiallySelected = (module: string) => {
    const modulePermissions = groupedPermissions[module] || [];
    const selectedCount = modulePermissions.filter((item) => selectedPermissions[item.key]).length;
    return selectedCount > 0 && selectedCount < modulePermissions.length;
  };

  const handleSubmit = async () => {
    if (!adminUser) return;
    const permissions = Object.keys(selectedPermissions).filter((key) => selectedPermissions[key]);
    await onSubmit(adminUser._id, permissions);
  };

  const selectedCount = Object.values(selectedPermissions).filter(Boolean).length;
  const originalCount = adminUser?.permissions?.length || 0;
  const hasChanges =
    selectedCount !== originalCount ||
    Object.keys(selectedPermissions).some(
      (key) => selectedPermissions[key] !== (adminUser?.permissions?.includes(key) || false)
    );

  if (!adminUser) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <span>Edit Permissions</span>
          <Chip label={adminUser.email} size="small" color="primary" variant="outlined" />
        </Box>
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
          {error && (
            <Alert severity="error" onClose={() => {}}>
              {error}
            </Alert>
          )}

          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="body2" color="text.secondary">
              Admin User: <strong>{adminUser.name}</strong>
            </Typography>
            <Chip
              label={`${selectedCount} permissions selected`}
              size="small"
              color={selectedCount > 0 ? 'success' : 'default'}
            />
          </Box>

          {catalogLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Stack spacing={2} sx={{ maxHeight: 500, overflow: 'auto' }}>
              {Object.keys(groupedPermissions).map((module) => (
                <Box key={module} sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isModuleFullySelected(module)}
                        indeterminate={isModulePartiallySelected(module)}
                        onChange={(e) => toggleModulePermissions(module, e.target.checked)}
                      />
                    }
                    label={
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {module}
                      </Typography>
                    }
                  />
                  <Stack direction="row" flexWrap="wrap" gap={1} sx={{ ml: 4, mt: 1 }}>
                    {groupedPermissions[module].map((item) => (
                      <FormControlLabel
                        key={item.key}
                        control={
                          <Checkbox
                            size="small"
                            checked={!!selectedPermissions[item.key]}
                            onChange={() => togglePermission(item.key)}
                          />
                        }
                        label={<Typography variant="body2">{item.label}</Typography>}
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
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !hasChanges}
          startIcon={loading ? <CircularProgress size={18} /> : null}
        >
          Update Permissions
        </Button>
      </DialogActions>
    </Dialog>
  );
}
