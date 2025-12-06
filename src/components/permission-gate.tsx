import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import type { RootState } from 'src/store/store';
import { SUPER_ADMIN_EMAIL } from 'src/constants/auth';

type Props = {
  requiredPermissions?: string[];
  requiredRole?: string[];
  superAdminOnly?: boolean;
  children: React.ReactNode;
};

export default function PermissionGate({
  requiredPermissions,
  requiredRole,
  superAdminOnly,
  children,
}: Props) {
  const user = useSelector((state: RootState) => state.user.user);
  let emailValue = user?.email || '';
  let roleValue = user?.role || '';
  let perms = user?.permissions || [];

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
        emailValue = payload.email || '';
        roleValue = payload.role || '';
        perms = payload.permissions || [];
      }
    }
  }

  // Super-admin: check by email (god mode - full access to everything)
  const isSuperAdmin = emailValue.toLowerCase() === SUPER_ADMIN_EMAIL;

  // If super admin only, check that
  if (superAdminOnly) {
    if (isSuperAdmin) {
      return <>{children}</>;
    }
    // Not a super admin, show error
    return (
      <Box p={3}>
        <Card>
          <CardContent>
            <Typography variant="h6">Access Denied</Typography>
            <Typography variant="body2" color="text.secondary">
              This section is only accessible to super administrators.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Role check
  const roleOk = !requiredRole || requiredRole.length === 0 || requiredRole.includes(roleValue);

  // Permission check
  const permOk =
    !requiredPermissions ||
    requiredPermissions.length === 0 ||
    requiredPermissions.some((p) => perms.includes(p));

  // Grant access if: super-admin, OR has required role, OR has required permission
  if (isSuperAdmin || (roleOk && permOk)) {
    return <>{children}</>;
  }

  return (
    <Box p={3}>
      <Card>
        <CardContent>
          <Typography variant="h6">Insufficient Permissions</Typography>
          <Typography variant="body2" color="text.secondary">
            Your account does not have access to this section.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
