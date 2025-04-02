import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

interface UserTableToolbarProps {
  numSelected: number;
  filterName: string;
  onFilterName: (event: React.ChangeEvent<HTMLInputElement>) => void;
  searchLoading: boolean;
  onBatchFilterClick: () => void;
}

export function UserTableToolbar({
  numSelected,
  filterName,
  onFilterName,
  searchLoading,
  onBatchFilterClick,
}: UserTableToolbarProps) {
  return (
    <Stack
      spacing={2}
      alignItems="center"
      direction={{
        xs: 'column',
        md: 'row',
      }}
      sx={{
        p: 2.5,
        pr: { xs: 2.5, md: 1 },
      }}
    >
      <TextField
        fullWidth
        value={filterName}
        onChange={onFilterName}
        placeholder="Search by email..."
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
          endAdornment: searchLoading && (
            <InputAdornment position="end">
              <Iconify icon="eos-icons:loading" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
          sx: {
            height: 40,
          },
        }}
      />

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<Iconify icon="mdi:filter-variant" />}
          onClick={onBatchFilterClick}
          sx={{
            minWidth: 'auto',
            px: 2,
            '& .MuiButton-startIcon': {
              mr: 0.5,
            },
          }}
        >
          Batches
        </Button>
      </Box>
    </Stack>
  );
}
