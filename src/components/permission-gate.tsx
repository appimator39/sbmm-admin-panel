import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import type { RootState } from 'src/store/store';

type Props = {
  requiredPermissions?: string[];
  requiredRole?: string[];
  children: React.ReactNode;
};

export default function PermissionGate({ requiredPermissions, requiredRole, children }: Props) {
  const user = useSelector((state: RootState) => state.user.user);
  let isAdmin = user?.role === 'admin';
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
        isAdmin = payload.role === 'admin';
        roleValue = payload.role || '';
        perms = payload.permissions || [];
      }
    }
  }

  const roleOk = !requiredRole || requiredRole.length === 0 || (roleValue ? requiredRole.includes(roleValue) : false);
  const permOk = !requiredPermissions || requiredPermissions.length === 0 || requiredPermissions.some((p) => perms.includes(p));

  if (isAdmin || (roleOk && permOk)) {
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
