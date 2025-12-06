import { SvgColor } from 'src/components/svg-color';
import { PERMISSIONS } from 'src/constants/permissions';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor width="100%" height="100%" src={`/assets/icons/navbar/${name}.svg`} />
);

export const navData = [
  {
    title: 'Dashboard',
    path: '/',
    icon: icon('ic-analytics'),
    // Dashboard accessible to all logged-in users
  },
  {
    title: 'User',
    path: '/user',
    icon: icon('ic-user'),
    requiredPermissions: [PERMISSIONS.MANAGE_USERS],
  },
  {
    title: 'Admin Users',
    path: '/admin-users',
    icon: icon('ic-user'),
    superAdminOnly: true, // Only super admin can manage sub-admins
  },
  {
    title: 'Urgent Notifications',
    path: '/urgent-notifications',
    icon: icon('ic-notification'),
    requiredPermissions: [PERMISSIONS.NOTIFICATION_MANAGE],
  },
  {
    title: 'Certificates',
    path: '/certificates',
    icon: icon('ic-certificate'),
    requiredPermissions: [PERMISSIONS.CERTIFICATE_VIEW_ADMIN],
  },
  {
    title: 'Batch',
    path: '/products',
    icon: icon('ic-batch'),
    requiredPermissions: [PERMISSIONS.MANAGE_BATCHES],
  },
  {
    title: 'Courses',
    path: '/blog',
    icon: icon('ic-courses'),
    requiredPermissions: [
      PERMISSIONS.COURSE_CREATE,
      PERMISSIONS.COURSE_UPDATE,
      PERMISSIONS.COURSE_DELETE,
      PERMISSIONS.COURSE_TOGGLE_PUBLISH,
    ],
  },
  {
    title: 'Chapters',
    path: '/chapters',
    icon: icon('ic-content'),
    requiredPermissions: [
      PERMISSIONS.CONTENT_CREATE,
      PERMISSIONS.CONTENT_UPDATE,
      PERMISSIONS.CONTENT_DELETE,
      PERMISSIONS.MANAGE_LECTURE,
      PERMISSIONS.UPLOAD_LECTURE,
      PERMISSIONS.UPLOAD_LECTURE_FILES,
    ],
  },
  {
    title: 'Quiz',
    path: '/quiz',
    icon: icon('ic-quiz'),
    requiredPermissions: [PERMISSIONS.QUIZ_MANAGE],
  },
  {
    title: 'Resources',
    path: '/resources',
    icon: icon('ic-resources'),
    requiredPermissions: [PERMISSIONS.RESOURCES_MANAGE, PERMISSIONS.RESOURCES_UPDATE_BATCHES],
  },
  {
    title: 'Email Invitations',
    path: '/email-invites',
    icon: icon('ic-email'),
    requiredPermissions: [PERMISSIONS.EMAIL_SEND],
  },
  {
    title: 'App Launches',
    path: '/app-launches',
    icon: icon('ic-rocket'),
    superAdminOnly: true, // Only super admin
  },
];
