import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor width="100%" height="100%" src={`/assets/icons/navbar/${name}.svg`} />
);

export const navData = [
  {
    title: 'Dashboard',
    path: '/',
    icon: icon('ic-analytics'),
  },
  {
    title: 'User',
    path: '/user',
    icon: icon('ic-user'),
  },
  {
    title: 'Batch',
    path: '/products',
    icon: icon('ic-batch'),
  },
  {
    title: 'Courses',
    path: '/blog',
    icon: icon('ic-courses'),
  },
  {
    title: 'Chapters',
    path: '/chapters',
    icon: icon('ic-content'),
  },
  {
    title: 'App Launches',
    path: '/app-launches',
    icon: icon('ic-rocket'),
  },
];
