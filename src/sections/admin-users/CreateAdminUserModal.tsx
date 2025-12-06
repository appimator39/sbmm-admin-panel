import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import Tooltip from '@mui/material/Tooltip';
import { Iconify } from 'src/components/iconify';

import type { PermissionCatalogItem } from 'src/hooks/use-admin-users';

interface CreateAdminUserModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { email: string; password: string; permissions: string[] }) => Promise<void>;
  catalog: PermissionCatalogItem[];
  catalogLoading: boolean;
  loading: boolean;
  error: string | null;
}

interface FormData {
  email: string;
  password: string;
}

export function CreateAdminUserModal({
  open,
  onClose,
  onSubmit,
  catalog,
  catalogLoading,
  loading,
  error,
}: CreateAdminUserModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<Record<string, boolean>>({});
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    trigger,
    watch,
    formState: { errors, isValid },
  } = useForm<FormData>({
    mode: 'onChange',
  });

  const watchEmail = watch('email');
  const watchPassword = watch('password');

  // Generate a random password that meets requirements
  const generateRandomPassword = () => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const special = '!@#$%^&*';
    const allChars = lowercase + uppercase + numbers + special;

    let password = '';
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    for (let i = 0; i < 8; i += 1) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    password = password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');

    setValue('password', password);
    trigger('password');
    setShowPassword(true);
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      reset();
      setSelectedPermissions({});
      setExpandedModules({});
      setShowPassword(false);
    }
  }, [open, reset]);

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

  const toggleModuleExpand = (module: string) => {
    setExpandedModules((prev) => ({ ...prev, [module]: !prev[module] }));
  };

  const isModuleFullySelected = (module: string) => {
    const modulePermissions = groupedPermissions[module] || [];
    return (
      modulePermissions.length > 0 &&
      modulePermissions.every((item) => selectedPermissions[item.key])
    );
  };

  const isModulePartiallySelected = (module: string) => {
    const modulePermissions = groupedPermissions[module] || [];
    const selectedCount = modulePermissions.filter((item) => selectedPermissions[item.key]).length;
    return selectedCount > 0 && selectedCount < modulePermissions.length;
  };

  const getModuleSelectedCount = (module: string) => {
    const modulePermissions = groupedPermissions[module] || [];
    return modulePermissions.filter((item) => selectedPermissions[item.key]).length;
  };

  const handleFormSubmit = async (data: FormData) => {
    const permissions = Object.keys(selectedPermissions).filter((key) => selectedPermissions[key]);
    await onSubmit({
      email: data.email,
      password: data.password,
      permissions,
    });
  };

  const selectedCount = Object.values(selectedPermissions).filter(Boolean).length;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh',
        },
      }}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        {/* Header */}
        <Box
          sx={{
            px: 3,
            py: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                bgcolor: 'primary.lighter',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Iconify icon="mdi:account-plus" width={22} sx={{ color: 'primary.main' }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                Create Admin User
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Add a new sub-admin with specific permissions
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={3}>
            {error && (
              <Alert severity="error" sx={{ borderRadius: 1.5 }}>
                {error}
              </Alert>
            )}

            {/* Credentials Section */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
                Account Credentials
              </Typography>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Email Address"
                  placeholder="admin@example.com"
                  size="medium"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: 'Please enter a valid email',
                    },
                  })}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify
                          icon="mdi:email-outline"
                          width={20}
                          sx={{ color: 'text.disabled' }}
                        />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Password"
                  placeholder="Enter password or generate one"
                  size="medium"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                    validate: (value) => {
                      const hasNumber = /\d/.test(value);
                      const hasLowercase = /[a-z]/.test(value);
                      const hasUppercase = /[A-Z]/.test(value);
                      if (!hasNumber || !hasLowercase || !hasUppercase) {
                        return 'Must include uppercase, lowercase, and number';
                      }
                      return true;
                    },
                  })}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify
                          icon="mdi:lock-outline"
                          width={20}
                          sx={{ color: 'text.disabled' }}
                        />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title="Generate random password">
                          <IconButton
                            onClick={generateRandomPassword}
                            edge="end"
                            size="small"
                            sx={{
                              mr: 0.5,
                              color: 'primary.main',
                              '&:hover': { bgcolor: 'primary.lighter' },
                            }}
                          >
                            <Iconify icon="mdi:auto-fix" width={20} />
                          </IconButton>
                        </Tooltip>
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                        >
                          <Iconify
                            icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                            width={20}
                          />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>
            </Box>

            {/* Permissions Section */}
            <Box>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  Permissions
                </Typography>
                {selectedCount > 0 && (
                  <Chip
                    label={`${selectedCount} selected`}
                    size="small"
                    color="primary"
                    variant="filled"
                  />
                )}
              </Box>

              {catalogLoading ? (
                <Box display="flex" justifyContent="center" py={6}>
                  <CircularProgress size={32} />
                </Box>
              ) : (
                <Box
                  sx={{
                    maxHeight: 320,
                    overflow: 'auto',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1.5,
                  }}
                >
                  {Object.keys(groupedPermissions).map((module, index) => {
                    const moduleCount = groupedPermissions[module].length;
                    const selectedModuleCount = getModuleSelectedCount(module);
                    const isExpanded = expandedModules[module];

                    return (
                      <Box
                        key={module}
                        sx={{
                          borderBottom:
                            index < Object.keys(groupedPermissions).length - 1
                              ? '1px solid'
                              : 'none',
                          borderColor: 'divider',
                        }}
                      >
                        <Box
                          sx={{
                            px: 2,
                            py: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'action.hover' },
                          }}
                          onClick={() => toggleModuleExpand(module)}
                        >
                          <Checkbox
                            size="small"
                            checked={isModuleFullySelected(module)}
                            indeterminate={isModulePartiallySelected(module)}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => toggleModulePermissions(module, e.target.checked)}
                          />
                          <Typography variant="subtitle2" sx={{ flex: 1, fontWeight: 500 }}>
                            {module}
                          </Typography>
                          <Chip
                            label={`${selectedModuleCount}/${moduleCount}`}
                            size="small"
                            variant={selectedModuleCount > 0 ? 'filled' : 'outlined'}
                            color={selectedModuleCount > 0 ? 'primary' : 'default'}
                            sx={{ height: 22, fontSize: '0.7rem' }}
                          />
                          <Iconify
                            icon={isExpanded ? 'eva:chevron-up-fill' : 'eva:chevron-down-fill'}
                            width={20}
                            sx={{ color: 'text.secondary' }}
                          />
                        </Box>

                        <Collapse in={isExpanded}>
                          <Box sx={{ px: 2, pb: 1.5, pl: 5.5 }}>
                            <Stack spacing={0.5}>
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
                                  label={
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                      {item.label}
                                    </Typography>
                                  }
                                  sx={{ m: 0 }}
                                />
                              ))}
                            </Stack>
                          </Box>
                        </Collapse>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>
          </Stack>
        </DialogContent>

        {/* Footer */}
        <Box
          sx={{
            px: 3,
            py: 2,
            display: 'flex',
            gap: 1.5,
            justifyContent: 'flex-end',
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Button variant="outlined" color="inherit" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!isValid || loading}
            startIcon={
              loading ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <Iconify icon="mdi:check" />
              )
            }
          >
            Create Admin
          </Button>
        </Box>
      </form>
    </Dialog>
  );
}
