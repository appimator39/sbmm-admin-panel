import { TableRow, TableHead, TableCell, Checkbox, TableSortLabel, Box } from '@mui/material';
import { TableHeadLabel } from 'src/components/table/types';

// ----------------------------------------------------------------------

interface QuizTableHeadProps {
  order: 'asc' | 'desc';
  orderBy: string;
  rowCount: number;
  numSelected: number;
  onSort: (id: string) => void;
  onSelectAllRows: (checked: boolean) => void;
  headLabel: TableHeadLabel[];
}

export function QuizTableHead({
  order,
  orderBy,
  rowCount,
  numSelected,
  onSort,
  onSelectAllRows,
  headLabel,
}: QuizTableHeadProps) {
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

        {headLabel.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align || 'left'}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{ width: headCell.width, minWidth: headCell.minWidth }}
          >
            <TableSortLabel
              hideSortIcon
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={() => onSort(headCell.id)}
            >
              {headCell.label}

              {orderBy === headCell.id ? (
                <Box sx={{ typography: 'caption', color: 'text.secondary' }}>
                  {order === 'desc' ? ' (desc)' : ' (asc)'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
} 