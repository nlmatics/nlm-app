import { Alert, Button, Col, Dropdown, Row, Space } from 'antd';
import fullLogoDarkTheme from '../../../assets/images/chattypdf-logo-vertical-black-bg.svg';
import fullLogoLightTheme from '../../../assets/images/chattypdf-logo-vertical-white-bg.svg';

import UserFeedback from '../UserFeedback';
import {
  CreditCardOutlined,
  LogoutOutlined,
  MailOutlined,
  PercentageOutlined,
  SwapOutlined,
  ToolOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useContext } from 'react';
import ThemeContext from '../../../contexts/theme/ThemContext';
import { useAuth } from '../../../utils/use-auth';
import { Link } from 'react-router-dom';

export default function AppHeader() {
  const { theme, THEMES, switchTheme, BRAND_COLOR } = useContext(ThemeContext);
  const hidePluginAlert = localStorage.getItem('hidePluginAlert') === 'true';
  const { signOut } = useAuth();
  return (
    <>
      <Row justify="center" style={{ marginBottom: 10 }}>
        <Col xs={{ span: 24 }} lg={{ span: 20 }}>
          {!hidePluginAlert && (
            <Alert
              message="Introducing ChattyPDF Chrome Plugin."
              type="info"
              showIcon
              action={
                <Space direction="horizontal" size="small">
                  <Button
                    size="small"
                    type="primary"
                    href="https://chrome.google.com/webstore/detail/chattypdf-plugin/iheimffbcmagfabfckkgnlmhfofldpge"
                    target="_blank"
                  >
                    Install
                  </Button>
                  <Button
                    size="small"
                    type="link"
                    href="https://www.chattypdf.com/#chrome-plugin"
                    target="_blank"
                  >
                    Know More
                  </Button>
                </Space>
              }
              closable
              onClose={() => localStorage.setItem('hidePluginAlert', true)}
            />
          )}
          <Row justify="center">
            <Col span={2}>
              <UserFeedback />
            </Col>
            <Col span={20} style={{ textAlign: 'center' }}>
              <img
                width={150}
                src={
                  theme === THEMES.LIGHT
                    ? fullLogoLightTheme
                    : fullLogoDarkTheme
                }
                alt="Chatty PDF Logo"
              />
            </Col>
            <Col span={2} style={{ textAlign: 'right' }}>
              <Dropdown
                trigger={['click']}
                menu={{
                  items: [
                    {
                      key: 'current-usage',
                      label: (
                        <Link to="/plan-and-usage">
                          <Button type="link" icon={<PercentageOutlined />}>
                            Current Usage
                          </Button>
                        </Link>
                      ),
                    },
                    {
                      key: 'subscribe',
                      label: (
                        <Link to="/subscribe">
                          <Button type="link" icon={<CreditCardOutlined />}>
                            Manage Subscription
                          </Button>
                        </Link>
                      ),
                    },
                    {
                      key: 'plugin',
                      label: (
                        <a
                          rel="noreferrer"
                          href="https://chrome.google.com/webstore/detail/chattypdf-plugin/iheimffbcmagfabfckkgnlmhfofldpge"
                          target="_blank"
                        >
                          <Button type="link" icon={<ToolOutlined />}>
                            Chrome Plugin
                          </Button>
                        </a>
                      ),
                    },
                    {
                      key: 'switch-theme',
                      label: (
                        <Button
                          type="link"
                          icon={<SwapOutlined />}
                          onClick={switchTheme}
                        >
                          Switch Theme
                        </Button>
                      ),
                    },
                    {
                      key: 'report-issue',
                      label: (
                        <Button
                          type="link"
                          icon={<MailOutlined />}
                          href="mailto:support@chattypdf.com"
                          style={{ color: BRAND_COLOR }}
                        >
                          Report Issue
                        </Button>
                      ),
                    },
                    {
                      key: 'logout',
                      label: (
                        <Button
                          type="link"
                          icon={<LogoutOutlined />}
                          onClick={signOut}
                        >
                          Logout
                        </Button>
                      ),
                    },
                  ],
                }}
                placement="bottomRight"
              >
                <Button type="link" icon={<UserOutlined />} />
              </Dropdown>
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
}
