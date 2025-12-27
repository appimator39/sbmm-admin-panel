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

// ----------------------------------------------------------------------

export const HomePage = lazy(() => import('src/pages/home'));
export const UserPage = lazy(() => import('src/pages/user'));
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
        { path: 'user', element: <UserPage /> },
        { path: 'products', element: <ProductsPage /> },
        { path: 'blog', element: <CoursesView /> },
        { path: 'chapters', element: (
          <PermissionGate requiredPermissions={["content_create","content_update","content_delete","manage_lecture","upload_lecture","upload_lecture_files"]}>
            <ChapterView />
          </PermissionGate>
        ) },
        { path: 'resources', element: (
          <PermissionGate requiredPermissions={["resources_manage","resources_update_batches"]}>
            <ResourcesView />
          </PermissionGate>
        ) },
        { path: 'app-launches', element: (
          <PermissionGate requiredRole={["admin"]}>
            <AppLaunchesView />
          </PermissionGate>
        ) },
        { path: 'email-invites', element: (
          <PermissionGate requiredRole={["admin"]}>
            <EmailInvitesPage />
          </PermissionGate>
        ) },
        { path: 'quiz', element: <QuizView /> },
        { path: 'urgent-notifications', element: (
          <PermissionGate requiredRole={["admin"]}>
            <UrgentNotificationsPage />
          </PermissionGate>
        ) },
        { path: 'certificates', element: (
          <PermissionGate requiredPermissions={["certificate_view_admin"]}>
            <CertificatesPage />
          </PermissionGate>
        ) },
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
