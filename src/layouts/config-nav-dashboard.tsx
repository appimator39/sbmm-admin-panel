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
    requiredPermissions: [],
  },
  {
    title: 'User',
    path: '/user',
    icon: icon('ic-user'),
    requiredRole: ['admin'],
  },
  {
    title: 'Urgent Notifications',
    path: '/urgent-notifications',
    icon: icon('ic-notification'),
    requiredRole: ['admin'],
  },
  {
    title: 'Certificates',
    path: '/certificates',
    icon: icon('ic-certificate'),
    requiredPermissions: ['certificate_view_admin'],
  },
  {
    title: 'Batch',
    path: '/products',
    icon: icon('ic-batch'),
    requiredPermissions: ['manage_batches'],
  },
  {
    title: 'Courses',
    path: '/blog',
    icon: icon('ic-courses'),
    requiredPermissions: ['course_create','course_update','course_delete','course_toggle_publish'],
  },
  {
    title: 'Chapters',
    path: '/chapters',
    icon: icon('ic-content'),
    requiredPermissions: ['content_create','content_update','content_delete','manage_lecture','upload_lecture','upload_lecture_files'],
  },
  {
    title: 'Quiz',
    path: '/quiz',
    icon: icon('ic-quiz'),
    requiredPermissions: ['quiz_manage'],
  },
  {
    title: 'Resources',
    path: '/resources',
    icon: icon('ic-resources'),
    requiredPermissions: ['resources_manage','resources_update_batches'],
  },
  {
    title: 'Email Invitations',
    path: '/email-invites',
    icon: icon('ic-email'),
    requiredRole: ['admin'],
  },
  {
    title: 'App Launches',
    path: '/app-launches',
    icon: icon('ic-rocket'),
    requiredRole: ['admin'],
  },
];
