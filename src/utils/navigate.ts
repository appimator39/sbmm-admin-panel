import { createBrowserHistory } from 'history';

export const history = createBrowserHistory();

export const navigateToLogin = () => {
  history.replace('/sign-in');
  window.location.reload();
};
