import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { UserView } from 'src/sections/user/view';
import PermissionGate from 'src/components/permission-gate';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Users - ${CONFIG.appName}`}</title>
      </Helmet>

      <PermissionGate requiredRole={["admin"]}>
        <UserView />
      </PermissionGate>
    </>
  );
}
