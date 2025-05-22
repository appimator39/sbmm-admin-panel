import { useState } from 'react';
import { format } from 'date-fns';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';

import { Iconify } from 'src/components/iconify';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

interface Quiz {
  _id: string;
  title: string;
  topicId: {
    _id: string;
    name: string;
    description: string;
  };
  batchIds: {
    _id: string;
    title: string;
    description: string;
  }[];
  questions: {
    question: string;
    options: string[];
    correctAnswer: number;
    _id: string;
  }[];
  totalMarks: number;
  passingMarks: number;
  lastDateToSubmit: string;
  submissions: {
    userId: string;
    answers: number[];
    score: number;
    _id: string;
  }[];
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

interface QuizTableRowProps {
  row: Quiz;
  selected: boolean;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
}

export function QuizTableRow({ row, selected, onSelectRow, onDeleteRow }: QuizTableRowProps) {
  const { title, topicId, batchIds, totalMarks, passingMarks, lastDateToSubmit, submissions } = row;
  const popover = usePopover();
  const [openConfirm, setOpenConfirm] = useState(false);

  const handleOpenConfirm = () => {
    setOpenConfirm(true);
    popover.onClose();
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const handleConfirmDelete = () => {
    onDeleteRow();
    handleCloseConfirm();
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="subtitle2">{title}</Typography>
          </Stack>
        </TableCell>

        <TableCell>{topicId.name}</TableCell>

        <TableCell>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {batchIds.map((batch) => (
              <Chip
                key={batch._id}
                label={batch.title}
                size="small"
                sx={{ 
                  bgcolor: 'primary.lighter',
                  color: 'primary.dark',
                  '&:hover': {
                    bgcolor: 'primary.light',
                  },
                }}
              />
            ))}
          </Stack>
        </TableCell>

        <TableCell>{totalMarks}</TableCell>

        <TableCell>{passingMarks}</TableCell>

        <TableCell>
          {format(new Date(lastDateToSubmit), 'dd MMM yyyy')}
        </TableCell>

        <TableCell>{submissions.length}</TableCell>

        <TableCell align="right">
          <IconButton color={popover.open ? 'primary' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={handleOpenConfirm}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>
      </CustomPopover>

      <Dialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Quiz
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone.
          </Alert>
          <Typography>
            Are you sure you want to delete the quiz &ldquo;{title}&rdquo;? This will remove all associated data including submissions.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 