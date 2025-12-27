import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { CourseView } from 'src/sections/course/view/course-view';
import { QuizView } from 'src/sections/quiz/view/quiz-view';
import PermissionGate from 'src/components/permission-gate';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Quizes - ${CONFIG.appName}`}</title>
      </Helmet>

      <PermissionGate requiredPermissions={["quiz_manage"]}>
        <QuizView />
      </PermissionGate>
    </>
  );
}
