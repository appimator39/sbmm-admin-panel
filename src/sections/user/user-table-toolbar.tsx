import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

interface UserTableToolbarProps {
  numSelected: number;
  filterName: string;
  onFilterName: (event: React.ChangeEvent<HTMLInputElement>) => void;
  searchLoading: boolean;
  onBatchFilterClick: () => void;
  selectedBatchIds: string[];
  batchNames: string[];
  onClearBatchFilter: () => void;
}

export function UserTableToolbar({
  numSelected,
  filterName,
  onFilterName,
  searchLoading,
  onBatchFilterClick,
  selectedBatchIds,
  batchNames,
  onClearBatchFilter,
}: UserTableToolbarProps) {
  const hasActiveBatchFilter = selectedBatchIds.length > 0;

  return (
    <Stack spacing={2} sx={{ p: 2.5, pr: { xs: 2.5, md: 1 } }}>
      {/* Search and Filter Row */}
      <Stack
        spacing={2}
        alignItems="center"
        direction={{
          xs: 'column',
          md: 'row',
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
            variant={hasActiveBatchFilter ? "contained" : "outlined"}
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
            {hasActiveBatchFilter && (
              <Chip
                size="small"
                label={selectedBatchIds.length}
                sx={{
                  ml: 1,
                  height: 20,
                  fontSize: '0.75rem',
                  bgcolor: 'primary.dark',
                  color: 'primary.contrastText',
                }}
              />
            )}
          </Button>
        </Box>
      </Stack>

      {/* Active Filters Row */}
      {hasActiveBatchFilter && (
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 'fit-content' }}>
            Filtered by batches:
          </Typography>
          {batchNames.map((batchName, index) => (
            <Chip
              key={selectedBatchIds[index]}
              label={batchName}
              size="small"
              variant="outlined"
              color="primary"
            />
          ))}
          <Button
            size="small"
            color="error"
            startIcon={<Iconify icon="mdi:close" />}
            onClick={onClearBatchFilter}
            sx={{ ml: 1 }}
          >
            Clear Filter
          </Button>
        </Stack>
      )}
    </Stack>
  );
}
