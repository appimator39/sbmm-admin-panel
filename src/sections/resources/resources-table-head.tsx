import { Checkbox, TableCell, TableHead, TableRow, TableSortLabel } from '@mui/material';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

interface ResourcesTableHeadProps {
  order: 'asc' | 'desc';
  orderBy: string;
  rowCount: number;
  numSelected: number;
  onSort: (id: string) => void;
  onSelectAllRows: (checked: boolean) => void;
}

export function ResourcesTableHead({
  order,
  orderBy,
  rowCount,
  numSelected,
  onSort,
  onSelectAllRows,
}: ResourcesTableHeadProps) {
  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={(event) => onSelectAllRows(event.target.checked)}
          />
        </TableCell>

        <TableCell>
          <TableSortLabel
            active={orderBy === 'title'}
            direction={orderBy === 'title' ? order : 'asc'}
            onClick={() => onSort('title')}
          >
            Title
          </TableSortLabel>
        </TableCell>

        <TableCell>Description</TableCell>

        <TableCell>File Name</TableCell>

        <TableCell>File Type</TableCell>

        <TableCell>
          <TableSortLabel
            active={orderBy === 'createdAt'}
            direction={orderBy === 'createdAt' ? order : 'asc'}
            onClick={() => onSort('createdAt')}
          >
            Created At
          </TableSortLabel>
        </TableCell>

        <TableCell align="right">
          <Iconify icon="solar:menu-dots-bold" />
        </TableCell>
      </TableRow>
    </TableHead>
  );
} 