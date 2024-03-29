import {
  Badge,
  Button,
  Card,
  Col,
  Layout,
  PageHeader,
  Row,
  Typography,
  message,
} from 'antd';
import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import fullLogoDarkTheme from '../../assets/images/nlmatics-logo-vertical-black-bg.svg';
import fullLogoLightTheme from '../../assets/images/nlmatics-logo-vertical-white-bg.svg';
import ThemeContext from '../../contexts/theme/ThemContext';
import { useAuth } from '../../utils/use-auth';
import useWorkspaces from './useWorkspaces';
import './index.less';
import useUserInfo from '../../hooks/useUserInfo';
import { joinWaitList } from '../hooks/mutator';
import { MailOutlined } from '@ant-design/icons';

const workspaceGroups = {
  MY: 'private_workspaces',
  SHARED: 'collaborated_workspaces',
  SUBSCRIBED: 'subscribed_workspaces',
  PUBLIC: 'public_workspaces',
  RESTRICTED: 'restricted_workspaces',
};

const getAllWorkspaces = groupedWorkspaces => {
  return [
    ...groupedWorkspaces[workspaceGroups.MY],
    ...groupedWorkspaces[workspaceGroups.SHARED],
    ...groupedWorkspaces[workspaceGroups.SUBSCRIBED],
    ...groupedWorkspaces[workspaceGroups.PUBLIC],
    ...groupedWorkspaces[workspaceGroups.RESTRICTED],
  ];
};

export default function EdgarWorkspaces() {
  const { user } = useAuth();
  const { theme, THEMES } = useContext(ThemeContext);
  let userId;
  const tokens = user?.displayName?.split('#');
  if (tokens.length > 1) {
    userId = tokens[1];
  }
  const { isRestrictedWorkspace } = useUserInfo();
  const { data: workspaces, isLoading: isFetchingWorkspaces } =
    useWorkspaces(userId);

  const [groupedWorkspaces, setGroupedWorkspaces] = useState({
    [workspaceGroups.MY]: [],
    [workspaceGroups.SHARED]: [],
    [workspaceGroups.SUBSCRIBED]: [],
    [workspaceGroups.PUBLIC]: [],
    [workspaceGroups.RESTRICTED]: [],
  });

  useEffect(() => {
    document.title = 'nlmatics SEC: Repositories';
  }, []);

  useEffect(() => {
    if (!isFetchingWorkspaces) {
      setGroupedWorkspaces(workspaces);
    }
  }, [workspaces, isFetchingWorkspaces]);

  const allWorkspaces = getAllWorkspaces(groupedWorkspaces);
  const allUniqueWorkspacesIds = [
    ...new Set(allWorkspaces.map(({ id }) => id)),
  ];
  const repoBodyStyle = {
    textAlign: 'center',
    padding: '30px 24px',
    height: 82,
  };
  return (
    <PageHeader
      style={{ height: '100vh', padding: 0 }}
      className="edgar-workspaces"
    >
      <Layout>
        <Layout.Content>
          <Row
            justify="center"
            align="middle"
            style={{
              height: '100vh',
              width: '100vw',
              overflow: 'auto',
              padding: 15,
            }}
          >
            <Col span={24} style={{ padding: 20 }}>
              <Row>
                <Col span={6} push={9} style={{ textAlign: 'center' }}>
                  <img
                    style={{ width: '100%', minWidth: 75, maxWidth: 150 }}
                    src={
                      theme === THEMES.LIGHT
                        ? fullLogoLightTheme
                        : fullLogoDarkTheme
                    }
                    alt="nlmatics Logo"
                  />
                </Col>
              </Row>
              <Row justify="center" style={{ marginTop: 50 }}>
                <Col span={8} style={{ textAlign: 'center' }}>
                  <Typography.Title level={5}>
                    SEC Filing Repositories
                  </Typography.Title>
                </Col>
              </Row>
              <Row justify="center" style={{ marginTop: 10 }}>
                <Col span={8} style={{ textAlign: 'center', minWidth: 200 }}>
                  <Row gutter={[20, 20]}>
                    {(isFetchingWorkspaces
                      ? [{ name: '', id: '' }]
                      : allUniqueWorkspacesIds
                    ).map(id => {
                      const repoCard = (
                        <Card
                          hoverable
                          bodyStyle={repoBodyStyle}
                          loading={isFetchingWorkspaces}
                        >
                          {
                            allWorkspaces.find(
                              ({ id: workspaceId }) => workspaceId === id
                            )?.name
                          }
                        </Card>
                      );
                      return (
                        <Col key={id} span={24}>
                          <Link
                            to={`/repository/${id}/${
                              isRestrictedWorkspace(id)
                                ? 'subscribe'
                                : 'agreements'
                            }`}
                          >
                            {isRestrictedWorkspace(id) ? (
                              <Badge.Ribbon
                                text="Subscription Expired"
                                color="red"
                                placement="start"
                              >
                                {repoCard}
                              </Badge.Ribbon>
                            ) : (
                              repoCard
                            )}
                          </Link>
                        </Col>
                      );
                    })}
                    {['M&A', '10K', 'Indentures'].map(repoName => (
                      <Col span={24} key={repoName}>
                        <Badge.Ribbon text="Coming Soon" placement="start">
                          <Card
                            bodyStyle={repoBodyStyle}
                            loading={isFetchingWorkspaces}
                            className="coming-soon-repo"
                          >
                            {repoName}
                            <Button
                              size="small"
                              className="join-wait-list"
                              type="primary"
                              onClick={async () => {
                                try {
                                  await joinWaitList(repoName);
                                  message.info(
                                    `Thank you for joining the ${repoName} wait list.`
                                  );
                                } catch (error) {
                                  message.error(
                                    'Something is wrong. We could not add you to waitlist.'
                                  );
                                }
                              }}
                            >
                              Join Waitlist
                            </Button>
                          </Card>
                        </Badge.Ribbon>
                      </Col>
                    ))}
                    <Col span={24}>
                      <Badge.Ribbon
                        text="Private"
                        placement="start"
                        color="orange"
                      >
                        <Card
                          bodyStyle={repoBodyStyle}
                          loading={isFetchingWorkspaces}
                          className="coming-soon-repo"
                        >
                          My Repository
                          <Button
                            size="small"
                            className="join-wait-list"
                            type="link"
                            icon={<MailOutlined />}
                            href="mailto:onboarding@nlmatics.com"
                          >
                            Contact Us
                          </Button>
                        </Card>
                      </Badge.Ribbon>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>
          </Row>
        </Layout.Content>
      </Layout>
    </PageHeader>
  );
}
