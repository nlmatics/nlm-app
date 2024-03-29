import { Button, Layout, Result, Spin } from 'antd';
import { useCookies } from 'react-cookie';
import { Link, Redirect, Route, Switch } from 'react-router-dom';
import './App.css';
import Importer from './components/Importer';
import DocumentProvider from './contexts/document/DocumentProvider';
import EntityTypesProvider from './contexts/entityTypes/EntityTypesProvider';
import './hilighters.less';
import DeveloperConsole from './pages/DeveloperConsole';
import Landing from './pages/Landing';
import PlanAndUsage from './pages/PlanAndUsage/PlanAndUsage';
import PrivateRoute from './pages/PrivateRoute';
import ReviewTrainingSamples from './pages/ReviewTrainingSamples';
import WithSideBar from './pages/WithSideBar';
import Workspaces from './pages/Workspaces';
import './themeOverrides.less';
import { useAuth } from './utils/use-auth.js';
import { lazy, Suspense } from 'react';
import Redactor from './pages/Redactor';

const Workspace = lazy(() => import('./pages/Workspace'));
const Search = lazy(() => import('./pages/Search'));
const SearchHome = lazy(() => import('./pages/SearchHome'));

function Nlmatics() {
  console.debug('Current APP: ', 'nlmatics');
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
                  : '/workspaces/all'
              }
            />
          ) : (
            <Redirect to="/login" />
          )}
        </PrivateRoute>

        <PrivateRoute exact path="/search/:workspaceId">
          <DocumentProvider>
            <Suspense fallback={<Spin />}>
              <SearchHome />
            </Suspense>
          </DocumentProvider>
        </PrivateRoute>

        <PrivateRoute exact path="/search/:workspaceId/results">
          <DocumentProvider>
            <EntityTypesProvider>
              <Suspense fallback={<Spin />}>
                <Search />
              </Suspense>
            </EntityTypesProvider>
          </DocumentProvider>
        </PrivateRoute>

        <PrivateRoute
          exact
          path="/search/:workspaceId/:documentId/:docActiveTabKey"
        >
          <DocumentProvider>
            <Suspense fallback={<Spin />}>
              <Search />
            </Suspense>
          </DocumentProvider>
        </PrivateRoute>

        <PrivateRoute exact path="/workspaces/:workspacesFilter">
          <WithSideBar keyForErrorBoundary="all">
            <Workspaces />
          </WithSideBar>
        </PrivateRoute>

        <PrivateRoute path="/workspace/:workspaceId">
          <WithSideBar keyForErrorBoundary="workspace">
            <DocumentProvider>
              <Suspense fallback={<Spin />}>
                <Workspace />
              </Suspense>
            </DocumentProvider>
          </WithSideBar>
        </PrivateRoute>

        <PrivateRoute exact path="/plan-and-usage">
          <WithSideBar keyForErrorBoundary="plan-and-usage">
            <PlanAndUsage />
          </WithSideBar>
        </PrivateRoute>

        <PrivateRoute exact path="/developer-console">
          <WithSideBar keyForErrorBoundary="developer-console">
            <DeveloperConsole />
          </WithSideBar>
        </PrivateRoute>

        <PrivateRoute exact path="/review-training-samples">
          <WithSideBar keyForErrorBoundary="review-training-samples">
            <ReviewTrainingSamples />
          </WithSideBar>
        </PrivateRoute>

        <PrivateRoute exact path="/import/:url?" source="importer">
          <Importer />
        </PrivateRoute>

        <Route path="/redactor">
          <Redactor />
        </Route>

        <Route path="*">
          <WithSideBar keyForErrorBoundary="404">
            <Result
              status="404"
              title="404"
              subTitle="Sorry, the page you visited does not exist."
              extra={
                <Link to="/workspaces/all">
                  <Button type="primary">Go Back Home</Button>
                </Link>
              }
            />
          </WithSideBar>
        </Route>
      </Switch>
    </Layout>
  );
}

export default Nlmatics;
