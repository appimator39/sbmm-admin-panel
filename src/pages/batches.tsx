import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { BatchView } from 'src/sections/batch/view/batch-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Products - ${CONFIG.appName}`}</title>
      </Helmet>

      <BatchView />
    </>
  );
}
