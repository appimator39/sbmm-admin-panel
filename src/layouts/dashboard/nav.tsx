import { useEffect } from 'react';

import Box from '@mui/material/Box';
import Drawer, { drawerClasses } from '@mui/material/Drawer';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import { useTheme } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import type { RootState } from 'src/store/store';
import { Logo } from 'src/components/logo';
import { Scrollbar } from 'src/components/scrollbar';
import { RouterLink } from 'src/routes/components';
import { usePathname } from 'src/routes/hooks';
import { varAlpha } from 'src/theme/styles';

import type { Theme, SxProps, Breakpoint } from '@mui/material/styles';

import { NavUpgrade } from '../components/nav-upgrade';

// ----------------------------------------------------------------------

export type NavContentProps = {
  data: {
    path: string;
    title: string;
    icon: React.ReactNode;
    info?: React.ReactNode;
  }[];
  slots?: {
    topArea?: React.ReactNode;
    bottomArea?: React.ReactNode;
  };

  sx?: SxProps<Theme>;
};

export function NavDesktop({
  sx,
  data,
  slots,
  layoutQuery,
}: NavContentProps & { layoutQuery: Breakpoint }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        px: 2.5,
        top: 0,
        left: 0,
        height: 1,
        display: 'none',
        position: 'fixed',
        flexDirection: 'column',
        bgcolor: 'var(--layout-nav-bg)',
        zIndex: 'var(--layout-nav-zIndex)',
        width: 'var(--layout-nav-vertical-width)',
        borderRight: `1px solid var(--layout-nav-border-color, ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)})`,
        [theme.breakpoints.up(layoutQuery)]: {
          display: 'flex',
        },
        ...sx,
      }}
    >
      <NavContent data={data} slots={slots} />
    </Box>
  );
}

// ----------------------------------------------------------------------

export function NavMobile({
  sx,
  data,
  open,
  slots,
  onClose,
}: NavContentProps & { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  useEffect(() => {
    if (open) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      sx={{
        [`& .${drawerClasses.paper}`]: {
          px: 2.5,
          overflow: 'unset',
          bgcolor: 'var(--layout-nav-bg)',
          width: 'var(--layout-nav-mobile-width)',
          ...sx,
        },
      }}
    >
      <NavContent data={data} slots={slots} />
    </Drawer>
  );
}

// ----------------------------------------------------------------------

export function NavContent({ data, slots, sx }: NavContentProps) {
  const pathname = usePathname();
  const user = useSelector((state: RootState) => state.user.user);
  let roleValue = user?.role || '';
  let perms = user?.permissions || [];
  let isAdmin = user?.role === 'admin';

  const decodeToken = (t: string) => {
    try {
      return JSON.parse(atob(t.split('.')[1]));
    } catch {
      return null;
    }
  };

  if (!user) {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = decodeToken(token);
      if (payload) {
        roleValue = payload.role || '';
        perms = payload.permissions || [];
        isAdmin = payload.role === 'admin';
      }
    }
  }

  const hasPermission = (required?: string[]) => {
    if (!required || required.length === 0) return true;
    if (isAdmin) return true;
    return required.some((p) => perms.includes(p));
  };

  const hasRole = (required?: string[]) => {
    if (!required || required.length === 0) return true;
    return required.includes(roleValue || '');
  };

  return (
    <>
      <Logo />

      {slots?.topArea}

      <Scrollbar fillContent>
        <Box component="nav" display="flex" flex="1 1 auto" flexDirection="column" sx={sx}>
          <Box component="ul" gap={0.5} display="flex" flexDirection="column">
            {data.map((item) => {
              const isActived = item.path === pathname;
              const disabled = !hasRole((item as any).requiredRole) && !hasPermission((item as any).requiredPermissions);

              return (
                <ListItem disableGutters disablePadding key={item.title}>
                  <ListItemButton
                    disableGutters
                    component={RouterLink}
                    href={item.path}
                    disabled={disabled}
                    sx={{
                      pl: 2,
                      py: 1,
                      gap: 2,
                      pr: 1.5,
                      borderRadius: 0.75,
                      typography: 'body2',
                      fontWeight: 'fontWeightMedium',
                      color: 'var(--layout-nav-item-color)',
                      minHeight: 'var(--layout-nav-item-height)',
                      ...(isActived && {
                        fontWeight: 'fontWeightSemiBold',
                        bgcolor: 'var(--layout-nav-item-active-bg)',
                        color: 'var(--layout-nav-item-active-color)',
                        '&:hover': {
                          bgcolor: 'var(--layout-nav-item-hover-bg)',
                        },
                      }),
                      ...(disabled && {
                        opacity: 0.5,
                        pointerEvents: 'none',
                      }),
                    }}
                  >
                    <Box component="span" sx={{ width: 24, height: 24 }}>
                      {item.icon}
                    </Box>

                    <Box component="span" flexGrow={1}>
                      {item.title}
                    </Box>

                    {item.info && item.info}
                  </ListItemButton>
                </ListItem>
              );
            })}
          </Box>
        </Box>
      </Scrollbar>

      {slots?.bottomArea}

      <NavUpgrade />
    </>
  );
}
