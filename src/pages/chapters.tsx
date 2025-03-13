import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { ChapterView } from 'src/sections/chapter/view/chapter-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Chapters - ${CONFIG.appName}`}</title>
      </Helmet>

      <ChapterView />
    </>
  );
}
