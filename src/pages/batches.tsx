import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { BatchView } from 'src/sections/batch/view/batch-view';
import PermissionGate from 'src/components/permission-gate';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Products - ${CONFIG.appName}`}</title>
      </Helmet>

      <PermissionGate requiredPermissions={["manage_batches"]}>
        <BatchView />
      </PermissionGate>
    </>
  );
}
