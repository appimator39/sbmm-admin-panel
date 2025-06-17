import { Helmet } from 'react-helmet-async';

import { CertificatesView } from 'src/sections/certificates';

// ----------------------------------------------------------------------

export default function CertificatesPage() {
  return (
    <>
      <Helmet>
        <title>Certificates</title>
      </Helmet>

      <CertificatesView />
    </>
  );
} 