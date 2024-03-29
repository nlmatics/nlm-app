import ReactDOM from 'react-dom';
import { QueryClientProvider, QueryClient } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

import './index.less';
import './nlm-theme.css';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter as Router } from 'react-router-dom';
import { ProvideAuth } from './utils/use-auth.js';
import WorkspaceContext from './components/WorkspaceContext';
import ThemeProvider from './contexts/theme/ThemeProvider';
import { message } from 'antd';
import AppProvider from './contexts/app/AppProvider';
import FreeTrialExpiryNotification from './chatty-pdf/components/FreeTrialExpiryNotification';
import debounce from './utils/debounce';
import { CookiesProvider } from 'react-cookie';

const onError = debounce(error => {
  console.error(error);
  let errMessage = 'Something went wrong. We are looking into it.';
  if (process.env.REACT_APP_APP_NAME === 'CHATTY_PDF') {
    errMessage = 'Our servers are busy. Please try again in a few minutes.';
  }
  if (
    error?.response?.data?.status === 403 &&
    error?.response?.data?.detail?.startsWith('Subscription limit reached')
  ) {
    if (process.env.REACT_APP_APP_NAME === 'CHATTY_PDF') {
      message.warning(<FreeTrialExpiryNotification />, 0);
    } else {
      message.warning(
        'Your free trial search quota has been exhausted, please subscribe to continue searching.',
        5
      );
    }
  } else {
    message.error(errMessage);
  }
}, 500);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      onError,
      retry: false,
    },
    mutations: {
      onError,
    },
  },
});

ReactDOM.render(
  <ProvideAuth>
    <Router>
      <WorkspaceContext>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <CookiesProvider>
              <AppProvider />
            </CookiesProvider>
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </ThemeProvider>
      </WorkspaceContext>
    </Router>
  </ProvideAuth>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
