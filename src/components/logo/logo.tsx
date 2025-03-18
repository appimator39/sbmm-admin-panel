import { forwardRef } from 'react';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

import type { BoxProps } from '@mui/material/Box';

// ----------------------------------------------------------------------

export type LogoProps = BoxProps & {
  href?: string;
  isSingle?: boolean;
  disableLink?: boolean;
};

export const Logo = forwardRef<HTMLDivElement, LogoProps>(
  (
    { width = 160, height = 160, href = '/', disableLink = false, className, sx, ...other },
    ref
  ) => {
    const theme = useTheme();

    const logo = (
      <Box
        alt="SBMM Logo"
        component="img"
        src="/assets/images/main_logo.png"
        width={width}
        height={height}
        sx={{ objectFit: 'contain', ...sx }}
        {...other}
      />
    );

    if (disableLink) {
      return logo;
    }

    return (
      <Box
        ref={ref}
        component="a"
        href={href}
        className={className}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...sx,
        }}
        {...other}
      >
        {logo}
      </Box>
    );
  }
);
