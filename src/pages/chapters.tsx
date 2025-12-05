import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { ChapterView } from 'src/sections/chapter/view/chapter-view';
import PermissionGate from 'src/components/permission-gate';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Chapters - ${CONFIG.appName}`}</title>
      </Helmet>

      <PermissionGate requiredPermissions={["content_create","content_update","content_delete","manage_lecture","upload_lecture","upload_lecture_files"]}>
        <ChapterView />
      </PermissionGate>
    </>
  );
}
