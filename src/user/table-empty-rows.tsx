import { TableCell, TableRow } from '@mui/material';

interface TableEmptyRowsProps {
  height: number;
  emptyRows: number;
}

export function TableEmptyRows({ height, emptyRows }: TableEmptyRowsProps) {
  if (!emptyRows) {
    return null;
  }

  return (
    <TableRow
      sx={{
        ...(height && {
          height: height * emptyRows,
        }),
      }}
    >
      <TableCell colSpan={9} />
    </TableRow>
  );
} 