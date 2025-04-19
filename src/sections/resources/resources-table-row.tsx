import { Checkbox, IconButton, MenuItem, TableCell, TableRow, Button } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { useState } from 'react';

interface ResourcesTableRowProps {
  row: {
    _id: string;
    title: string;
    description: string;
    fileName: string;
    fileType: string;
    createdAt: string;
  };
  selected: boolean;
  onSelectRow: () => void;
  onDeleteRow: () => void;
}

export function ResourcesTableRow({
  row,
  selected,
  onSelectRow,
  onDeleteRow,
}: ResourcesTableRowProps) {
  const [openPopover, setOpenPopover] = useState<HTMLElement | null>(null);
  const [openConfirm, setOpenConfirm] = useState(false);

  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  const handleOpenConfirm = () => {
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell>{row.title}</TableCell>

        <TableCell>{row.description}</TableCell>

        <TableCell>{row.fileName}</TableCell>

        <TableCell>{row.fileType}</TableCell>

        <TableCell>{new Date(row.createdAt).toLocaleDateString()}</TableCell>

        <TableCell align="right">
          <IconButton color={openPopover ? 'inherit' : 'default'} onClick={handleOpenPopover}>
            <Iconify icon="solar:menu-dots-bold" />
          </IconButton>
        </TableCell>
      </TableRow>

      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        title="Delete"
        content="Are you sure you want to delete this resource?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              onDeleteRow();
              handleCloseConfirm();
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  );
} 