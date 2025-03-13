import { createRoot } from 'react-dom/client';

import App from './app';

const AppWrapper = () => <App />;

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<AppWrapper />);
