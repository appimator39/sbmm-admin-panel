import { useState, useCallback } from 'react';
import Popover from '@mui/material/Popover';

// ----------------------------------------------------------------------

export function usePopover() {
  const [open, setOpen] = useState<HTMLElement | null>(null);

  const onOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setOpen(event.currentTarget);
  }, []);

  const onClose = useCallback(() => {
    setOpen(null);
  }, []);

  return {
    open,
    onOpen,
    onClose,
  };
}

// ----------------------------------------------------------------------

interface CustomPopoverProps {
  open: HTMLElement | null;
  onClose: VoidFunction;
  children: React.ReactNode;
  arrow?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'left-top' | 'left-center' | 'left-bottom' | 'right-top' | 'right-center' | 'right-bottom';
  sx?: object;
}

export function CustomPopover({ open, onClose, children, arrow = 'bottom-right', sx, ...other }: CustomPopoverProps) {
  return (
    <Popover
      open={Boolean(open)}
      anchorEl={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: arrow.includes('top') ? 'top' : 'bottom',
        horizontal: arrow.includes('left') ? 'left' : 'right',
      }}
      transformOrigin={{
        vertical: arrow.includes('top') ? 'bottom' : 'top',
        horizontal: arrow.includes('left') ? 'right' : 'left',
      }}
      PaperProps={{
        sx: {
          p: 1,
          width: 200,
          overflow: 'inherit',
          ...sx,
        },
      }}
      {...other}
    >
      {children}
    </Popover>
  );
} 