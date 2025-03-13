import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { CourseView } from 'src/sections/course/view/course-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Blog - ${CONFIG.appName}`}</title>
      </Helmet>

      <CourseView />
    </>
  );
}
