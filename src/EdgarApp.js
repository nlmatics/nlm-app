import { Button, Layout, Result, Spin } from 'antd';
import { useCookies } from 'react-cookie';
import { Link, Redirect, Route, Switch } from 'react-router-dom';
import './App.css';
import DocumentConfigProvider from './components/workspace/Document/DocumentConfigProvider';
import DocumentProvider from './contexts/document/DocumentProvider';
import EdgarErrorBoundary from './edgar/EdgarErrorBoundary';
import EdgarWorkspace from './edgar/EdgarWorkspace/EdgarWorkspace';
import EdgarWorkspaces from './edgar/EdgarWorkspaces/EdgarWorkspaces';
import './hilighters.less';
import Landing from './pages/Landing';
import PrivateRoute from './pages/PrivateRoute';
import './themeOverrides.less';
import { useAuth } from './utils/use-auth.js';
import FieldFiltersProvider from './contexts/fieldFilters/FieldFiltersProvider';
import Trends from './pages/Trends';

function EdgarApp() {
  console.debug('Current APP: ', 'NEW EDGAR');
  const { initializing } = useAuth();

  const [cookies] = useCookies(['access_token']);
  const redirectUrl = localStorage.getItem('redirectUrl');
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
                redirectUrl && redirectUrl !== '/'
                  ? redirectUrl
                  : '/repositories'
              }
            />
          ) : (
            <Redirect to="/login" />
          )}
        </PrivateRoute>

        <Route path="/credit-agreement-trends">
          <Trends />
        </Route>

        <PrivateRoute exact path="/repositories">
          <EdgarErrorBoundary key="repositories">
            <EdgarWorkspaces />
          </EdgarErrorBoundary>
        </PrivateRoute>
        <PrivateRoute path="/repository/:workspaceId/:page">
          <EdgarErrorBoundary key="repository">
            <DocumentConfigProvider>
              <DocumentProvider isEdgar>
                <FieldFiltersProvider>
                  <EdgarWorkspace />
                </FieldFiltersProvider>
              </DocumentProvider>
            </DocumentConfigProvider>
          </EdgarErrorBoundary>
        </PrivateRoute>

        <Route path="*">
          <Result
            status="404"
            title="404"
            subTitle="Sorry, the page you visited does not exist."
            extra={
              <Link to="/repositories">
                <Button type="primary">Go Back Home</Button>
              </Link>
            }
          />
        </Route>
      </Switch>
    </Layout>
  );
}

export default EdgarApp;
