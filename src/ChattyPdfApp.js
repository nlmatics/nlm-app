import { Button, Layout, Result, Spin } from 'antd';
import { useCookies } from 'react-cookie';
import { Link, Redirect, Route, Switch } from 'react-router-dom';
import './App.css';
import ChattyPdfErrorBoundary from './chatty-pdf/components/ChattyPdfErrorBoundary';
import DefaultWorkspaceSetter from './chatty-pdf/pages/DefaultWorkspaceSetter';
import DocumentsManagerPage from './chatty-pdf/pages/DocumentsManagerPage';
import DocumentProvider from './contexts/document/DocumentProvider';
import './hilighters.less';
import Landing from './pages/Landing';
import PrivateRoute from './pages/PrivateRoute';
import './themeOverrides.less';
import { useAuth } from './utils/use-auth.js';
import Importer from './components/Importer';
import { useEffect } from 'react';
import Subscription from './chatty-pdf/pages/Subscription';
import ChattyPdfPlanAndUsage from './chatty-pdf/pages/ChattyPdfPlanAndUsage';

function ChattyPdfApp() {
  console.debug('Current APP: ', 'Chatty PDF');
  const { initializing } = useAuth();

  const [cookies] = useCookies(['access_token']);
  const redirectUrl = localStorage.getItem('redirectUrl');

  useEffect(() => {
    if (window !== window.parent) {
      const storageHandler = () => {
        const authItems = ['access_token', 'refresh_token', 'displayName'];
        if (authItems.every(authItem => !!localStorage.getItem(authItem))) {
          // authWindow is set in Landing.js
          if (window.authWindow) {
            window.authWindow.close();
            // Reload only during authentication
            // or else this leads to infinite loop when
            // 2 instances of plugin are launched in 2 tabs
            window.location.reload();
          }
        }
      };
      window.addEventListener('storage', storageHandler);
      return () => {
        window.removeEventListener('storage', storageHandler);
      };
    }
  }, []);

  return initializing ? (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        paddingTop: '30vh',
      }}
    >
      <Spin size="large" tip="Loading..." />
    </div>
  ) : (
    <Layout style={{ minHeight: '100vh' }}>
      <Switch>
        <Route path="/login">
          <Landing from={redirectUrl} />
        </Route>

        <PrivateRoute exact path="/">
          {cookies.refresh_token ? (
            <Redirect
              to={
                redirectUrl && redirectUrl !== '/' ? redirectUrl : '/documents'
              }
            />
          ) : (
            <Redirect to="/login" />
          )}
        </PrivateRoute>

        <PrivateRoute exact path="/documents">
          <DefaultWorkspaceSetter />
        </PrivateRoute>

        <PrivateRoute exact path="/documents/:workspaceId">
          <DocumentProvider>
            <ChattyPdfErrorBoundary>
              <DocumentsManagerPage />
            </ChattyPdfErrorBoundary>
          </DocumentProvider>
        </PrivateRoute>

        <PrivateRoute exact path="/plan-and-usage">
          <ChattyPdfPlanAndUsage />
        </PrivateRoute>

        <PrivateRoute exact path="/subscribe">
          <Subscription />
        </PrivateRoute>

        <PrivateRoute exact path="/import/:url?" source="importer">
          <DocumentProvider>
            <Importer />
          </DocumentProvider>
        </PrivateRoute>

        <Route path="*">
          <Result
            status="404"
            title="404"
            subTitle="Sorry, the page you visited does not exist."
            extra={
              <Link to="/documents">
                <Button type="primary">Go Back Home</Button>
              </Link>
            }
          />
        </Route>
      </Switch>
    </Layout>
  );
}

export default ChattyPdfApp;
