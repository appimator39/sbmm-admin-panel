import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { UrgentNotificationsView } from 'src/sections/urgent-notifications/view/urgent-notifications-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Urgent Notifications - ${CONFIG.appName}`}</title>
      </Helmet>

      <UrgentNotificationsView />
    </>
  );
} 