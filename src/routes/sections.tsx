import { lazy, Suspense } from 'react';
import { Outlet, Navigate, useRoutes } from 'react-router-dom';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import { AuthLayout } from 'src/layouts/auth';
import { DashboardLayout } from 'src/layouts/dashboard';
import { ChapterView } from 'src/sections/chapter/view/chapter-view';
import { varAlpha } from 'src/theme/styles';
import AppLaunchesView from 'src/sections/app-launches/view/AppLaunchesView';
import ResourcesView from 'src/sections/resources/resources-view';
import PermissionGate from 'src/components/permission-gate';
import { PERMISSIONS } from 'src/constants/permissions';

// ----------------------------------------------------------------------

export const HomePage = lazy(() => import('src/pages/home'));
export const UserPage = lazy(() => import('src/pages/user'));
export const AdminUsersPage = lazy(() => import('src/pages/admin-users'));
export const ProductsPage = lazy(() => import('src/pages/batches'));
export const SignInPage = lazy(() => import('src/pages/sign-in'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));
export const CoursesView = lazy(() => import('src/pages/courses'));
export const QuizView = lazy(() => import('src/pages/quiz'));
export const EmailInvitesPage = lazy(() => import('src/pages/dashboard/email-invites'));
export const UrgentNotificationsPage = lazy(() => import('src/pages/urgent-notifications'));
export const CertificatesPage = lazy(() => import('src/pages/certificates'));

// ----------------------------------------------------------------------

const renderFallback = (
  <Box display="flex" alignItems="center" justifyContent="center" flex="1 1 auto">
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
        [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
      }}
    />
  </Box>
);

export function Router() {
  return useRoutes([
    {
      element: (
        <DashboardLayout>
          <Suspense fallback={renderFallback}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      ),
      children: [
        { element: <HomePage />, index: true },
        {
          path: 'user',
          element: (
            <PermissionGate requiredPermissions={[PERMISSIONS.MANAGE_USERS]}>
              <UserPage />
            </PermissionGate>
          ),
        },
        {
          path: 'admin-users',
          element: (
            <PermissionGate superAdminOnly>
              <AdminUsersPage />
            </PermissionGate>
          ),
        },
        {
          path: 'products',
          element: (
            <PermissionGate requiredPermissions={[PERMISSIONS.MANAGE_BATCHES]}>
              <ProductsPage />
            </PermissionGate>
          ),
        },
        {
          path: 'blog',
          element: (
            <PermissionGate
              requiredPermissions={[
                PERMISSIONS.COURSE_CREATE,
                PERMISSIONS.COURSE_UPDATE,
                PERMISSIONS.COURSE_DELETE,
                PERMISSIONS.COURSE_TOGGLE_PUBLISH,
              ]}
            >
              <CoursesView />
            </PermissionGate>
          ),
        },
        {
          path: 'chapters',
          element: (
            <PermissionGate
              requiredPermissions={[
                PERMISSIONS.CONTENT_CREATE,
                PERMISSIONS.CONTENT_UPDATE,
                PERMISSIONS.CONTENT_DELETE,
                PERMISSIONS.MANAGE_LECTURE,
                PERMISSIONS.UPLOAD_LECTURE,
                PERMISSIONS.UPLOAD_LECTURE_FILES,
              ]}
            >
              <ChapterView />
            </PermissionGate>
          ),
        },
        {
          path: 'resources',
          element: (
            <PermissionGate
              requiredPermissions={[
                PERMISSIONS.RESOURCES_MANAGE,
                PERMISSIONS.RESOURCES_UPDATE_BATCHES,
              ]}
            >
              <ResourcesView />
            </PermissionGate>
          ),
        },
        {
          path: 'app-launches',
          element: (
            <PermissionGate superAdminOnly>
              <AppLaunchesView />
            </PermissionGate>
          ),
        },
        {
          path: 'email-invites',
          element: (
            <PermissionGate requiredPermissions={[PERMISSIONS.EMAIL_SEND]}>
              <EmailInvitesPage />
            </PermissionGate>
          ),
        },
        {
          path: 'quiz',
          element: (
            <PermissionGate requiredPermissions={[PERMISSIONS.QUIZ_MANAGE]}>
              <QuizView />
            </PermissionGate>
          ),
        },
        {
          path: 'urgent-notifications',
          element: (
            <PermissionGate requiredPermissions={[PERMISSIONS.NOTIFICATION_MANAGE]}>
              <UrgentNotificationsPage />
            </PermissionGate>
          ),
        },
        {
          path: 'certificates',
          element: (
            <PermissionGate requiredPermissions={[PERMISSIONS.CERTIFICATE_VIEW_ADMIN]}>
              <CertificatesPage />
            </PermissionGate>
          ),
        },
      ],
    },
    {
      path: 'sign-in',
      element: (
        <AuthLayout>
          <SignInPage />
        </AuthLayout>
      ),
    },
    {
      path: '404',
      element: <Page404 />,
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);
}
