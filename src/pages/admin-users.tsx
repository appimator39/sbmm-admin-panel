import { Helmet } from 'react-helmet-async';

import { AdminUsersView } from 'src/sections/admin-users';

// ----------------------------------------------------------------------

export default function AdminUsersPage() {
  return (
    <>
      <Helmet>
        <title>Admin Users | SBMM Dashboard</title>
      </Helmet>

      <AdminUsersView />
    </>
  );
}
