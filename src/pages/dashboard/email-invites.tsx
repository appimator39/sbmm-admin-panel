import { Helmet } from 'react-helmet-async';

import { EmailInvitesView } from 'src/sections/email-invites/email-invites-view';

export default function EmailInvitesPage() {
  return (
    <>
      <Helmet>
        <title> Email Invitations | SBMM Admin Panel</title>
      </Helmet>

      <EmailInvitesView />
    </>
  );
} 