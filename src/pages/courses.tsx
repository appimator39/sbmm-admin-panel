import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { CourseView } from 'src/sections/course/view/course-view';
import PermissionGate from 'src/components/permission-gate';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Blog - ${CONFIG.appName}`}</title>
      </Helmet>

      <PermissionGate requiredPermissions={["course_create","course_update","course_delete","course_toggle_publish"]}>
        <CourseView />
      </PermissionGate>
    </>
  );
}
