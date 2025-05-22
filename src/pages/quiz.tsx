import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { CourseView } from 'src/sections/course/view/course-view';
import { QuizView } from 'src/sections/quiz/view/quiz-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Quizes - ${CONFIG.appName}`}</title>
      </Helmet>

      <QuizView />
    </>
  );
}
