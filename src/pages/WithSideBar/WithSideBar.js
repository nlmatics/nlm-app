import AppErrorBoundary from '../../components/AppErrorBoundary';

import {
  AppstoreFilled,
  BorderOutlined,
  ExperimentOutlined,
  IssuesCloseOutlined,
  LogoutOutlined,
  PieChartOutlined,
  UserOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import { useEffect, useState, useRef, useContext } from 'react';
import {
  useHistory,
  useParams,
  useRouteMatch,
  useLocation,
} from 'react-router-dom';
import API from '../../utils/API.js';
import {
  clearDocSearchCriteria,
  clearWorkspaceSearchCriteria,
  clearWorkspaceSearchResults,
} from '../../utils/helpers';
import './index.css';
import fullLogoLightTheme from '../../assets/images/nlmatics-logo-vertical-white-bg.svg';
import fullLogoDarkTheme from '../../assets/images/nlmatics-logo-vertical-black-bg.svg';
import shortLogo from '../../assets/images/nlmatics-icon.svg';
import { useAuth } from '../../utils/use-auth';
import ThemeContext from '../../contexts/theme/ThemContext.js';
import useUserInfo from '../../hooks/useUserInfo';
import useUserPermission from '../../hooks/useUserPermission';
import { WorkspaceContext } from '../../components/WorkspaceContext';
import { useQueryClient } from 'react-query';
import { roles } from '../../utils/constants';

const { Sider } = Layout;

export default function WithSideBar({ children, keyForErrorBoundary }) {
  const workspaceContext = useContext(WorkspaceContext);
  const history = useHistory();
  const { path } = useRouteMatch();
  const { pathname } = useLocation();
  const { workspaceId } = useParams();
  const { signOut } = useAuth();
  const { theme, switchTheme, THEMES } = useContext(ThemeContext);
  const [collapsed, setCollapsed] = useState(true);
  const [openWorkspaces, setOpenWorkspaces] = useState([]);
  const { data: userInfo } = useUserInfo();
  const workspaceIdByPathMapRef = useRef({});
  const queryClient = useQueryClient();

  workspaceIdByPathMapRef.current = {
    ...workspaceIdByPathMapRef.current,
    [workspaceId]: pathname,
  };

  useEffect(() => {
    if (userInfo) {
      workspaceContext.setCurrentUserRole(roles[userInfo.accessType]);
    }
  }, [userInfo]);

  // This sets user permission in workspaceContext.currentUserRole
  useUserPermission();

  let selectedKeys;

  if (path.indexOf('/workspaces/') > -1) {
    selectedKeys = ['workspaces'];
  }
  if (path.indexOf('/plan-and-usage') > -1) {
    selectedKeys = ['plan-and-usage'];
  }
  if (path.indexOf('/developer-console') > -1) {
    selectedKeys = ['developer-console'];
  }
  if (path.indexOf('/review-training-samples') > -1) {
    selectedKeys = ['review-training-samples'];
  }

  useEffect(() => {
    async function fetchWorkspaceById(workspaceId) {
      let res = await API.get(`/workspace/${workspaceId}`, {});
      setOpenWorkspaces(openWorkspaces => [
        ...new Map(
          [
            // Limit to only 5 open workspaces
            ...(openWorkspaces.length > 4
              ? openWorkspaces.slice(1)
              : openWorkspaces),
            res.data,
          ].map(openworkSpace => [openworkSpace.id, openworkSpace])
        ).values(),
      ]);
    }
    if (workspaceId && !openWorkspaces.find(({ id }) => id === workspaceId)) {
      fetchWorkspaceById(workspaceId);
    }
  }, [workspaceId, openWorkspaces]);

  const clearWorkspaceData = workspaceId => {
    clearWorkspaceSearchCriteria(workspaceContext);
    clearWorkspaceSearchResults(workspaceContext);
    clearDocSearchCriteria(workspaceContext);
    queryClient.removeQueries({
      predicate: ({ queryKey }) => {
        return queryKey.includes(workspaceId);
      },
    });
  };
  const closeWorkspace = () => {
    setOpenWorkspaces(openWorkspaces.filter(({ id }) => id !== workspaceId));
    workspaceContext.setCurrentUserRole(roles[userInfo.accessType]);
  };

  return (
    <Layout
      style={{
        minHeight: '100vh',
      }}
    >
      <Sider
        theme={theme}
        collapsedWidth={50}
        width={90}
        collapsible
        collapsed={collapsed}
        onCollapse={value => setCollapsed(value)}
      >
        <div
          className="nlm-logo nlm-logo-short"
          style={{ display: collapsed ? 'block' : 'none' }}
        >
          <img src={shortLogo} alt="nlmatics Logo" />
        </div>
        <div
          className="nlm-logo nlm-logo-full"
          style={{ display: collapsed ? 'none' : 'block' }}
        >
          <img
            src={
              theme === THEMES.LIGHT ? fullLogoLightTheme : fullLogoDarkTheme
            }
            alt="nlmatics Logo"
          />
        </div>
        <Menu
          theme={theme}
          className="nlm-sider-menu"
          defaultSelectedKeys={['workspaces']}
          mode="vertical"
          selectedKeys={workspaceId ? [workspaceId] : selectedKeys}
          items={[
            {
              key: 'workspaces',
              title: 'Workspaces',
              className: 'nlm-sider-menu-item',
              onClick: () => history.push(`/workspaces/all`),
              label: (
                <>
                  <div className="nlm-menu-icon">
                    <AppstoreFilled style={{ fontSize: 20, lineHeight: 0 }} />
                  </div>
                  <label> {collapsed ? 'W' : 'Workspaces'}</label>
                </>
              ),
            },
            ...openWorkspaces.map(({ id, name }) => ({
              className: 'nlm-sider-menu-item',
              key: id,
              title: id === workspaceId ? `Close ${name}` : name,
              onClick: () => {
                if (id === workspaceId) {
                  closeWorkspace();
                  history.push(`/workspaces/all`);
                } else {
                  history.push(workspaceIdByPathMapRef.current[id]);
                }
              },
              label: (
                <>
                  <div className="nlm-menu-icon">
                    <BorderOutlined style={{ fontSize: 20, lineHeight: 0 }} />
                  </div>
                  <label>
                    {collapsed
                      ? name
                          .split(' ')
                          .map(s => s[0])
                          .join('')
                          .toUpperCase()
                      : name}
                  </label>
                </>
              ),
            })),
            {
              key: 'user',
              className: 'nlm-sider-menu-item nlm-user',
              icon: <UserOutlined style={{ fontSize: 20, lineHeight: 0 }} />,
              children: [
                {
                  className: 'nlm-sider-menu-item',
                  key: 'theme',
                  icon: (
                    <SwapOutlined style={{ fontSize: 20, lineHeight: 0 }} />
                  ),
                  onClick: switchTheme,
                  label: 'Switch Theme',
                },
                {
                  className: 'nlm-sider-menu-item',
                  key: 'plan-and-usage',
                  icon: (
                    <PieChartOutlined style={{ fontSize: 20, lineHeight: 0 }} />
                  ),
                  onClick: () => history.push(`/plan-and-usage`),
                  label: 'Plan and Usage',
                },
                ...(userInfo && userInfo.hasDeveloperAccount
                  ? [
                      {
                        className: 'nlm-sider-menu-item',
                        key: 'developer-console',
                        icon: (
                          <ExperimentOutlined
                            style={{ fontSize: 20, lineHeight: 0 }}
                          />
                        ),
                        onClick: () => history.push(`/developer-console`),
                        label: 'Developer API',
                      },
                    ]
                  : []),
                ...(userInfo && userInfo.isAdmin
                  ? [
                      {
                        className: 'nlm-sider-menu-item',
                        key: 'review-training-samples',
                        icon: (
                          <IssuesCloseOutlined
                            style={{ fontSize: 20, lineHeight: 0 }}
                          />
                        ),
                        onClick: () => history.push(`/review-training-samples`),
                        label: 'Review Training Samples',
                      },
                    ]
                  : []),
                {
                  className: 'nlm-sider-menu-item',
                  key: 'logout',
                  onClick: signOut,
                  icon: (
                    <LogoutOutlined style={{ fontSize: 20, lineHeight: 0 }} />
                  ),
                  label: 'Logout',
                },
              ],
            },
          ]}
        />
      </Sider>
      <Layout className="site-layout">
        <AppErrorBoundary
          key={keyForErrorBoundary}
          closeWorkspace={() => {
            closeWorkspace();
            clearWorkspaceData(workspaceId);
          }}
        >
          {children}
        </AppErrorBoundary>
      </Layout>
    </Layout>
  );
}
