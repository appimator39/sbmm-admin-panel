import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
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
