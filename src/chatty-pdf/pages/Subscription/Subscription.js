import {
  Button,
  Card,
  Layout,
  List,
  Statistic,
  Col,
  Typography,
  Row,
  Spin,
  Popconfirm,
  Tag,
} from 'antd';
import { showError } from '../../../utils/apiCalls';
import API from '../../../utils/API';
import { useState } from 'react';
import {
  ArrowLeftOutlined,
  CheckCircleFilled,
  CreditCardOutlined,
  MailOutlined,
  StopFilled,
  StopOutlined,
} from '@ant-design/icons';
import useSubscriptionPlan from '../../hooks/useSubscriptionPlan';
import AppHeader from '../../components/AppHeader/AppHeader';
import useUserInfo from '../../../hooks/useUserInfo';
import './index.less';
import { Link } from 'react-router-dom';
const { Title, Text } = Typography;

export default function Subscription() {
  const {
    getSubscriptionPlan,
    isLoading: fetchingSubscriptionPlans,
    useRefetchSubscriptionPlans,
  } = useSubscriptionPlan();
  const { useRefetchUserInfo } = useUserInfo();
  const refetchUserInfo = useRefetchUserInfo();
  const refetchSubscriptionPlans = useRefetchSubscriptionPlans();
  const plan = getSubscriptionPlan();
  const [isUpdatingCancelStatus, setIsUpdatingCancelStatus] = useState(false);
  const [isUpdatingSubscribeStatus, setIsUpdatingSubscribeStatus] =
    useState(false);

  const pickPlan = async ({ plan, update_payment_info }) => {
    const data = {
      lookup_key: {
        ...plan,
        return_path: `/subscribe`,
        update_payment_info,
      },
    };
    try {
      !update_payment_info && setIsUpdatingSubscribeStatus(true);
      let response = await API.post(`/subscription/changePlan`, data, {
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
      });
      !update_payment_info && setIsUpdatingSubscribeStatus(false);
      if (response.status === 200) {
        if (response.data.redirect_url) {
          window.location.href = response.data.redirect_url;
        } else {
          refetchSubscriptionPlans();
          refetchUserInfo();
        }
      }
    } catch (error) {
      showError(error);
    }
  };

  const cancelPlan = async plan => {
    const data = {
      lookup_key: {
        ...plan,
        return_path: `/subscribe`,
      },
    };
    try {
      setIsUpdatingCancelStatus(true);
      let response = await API.post(`/subscription/cancelPlan`, data, {
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
      });
      setIsUpdatingCancelStatus(false);
      if (response.status === 200) {
        if (response.data.redirect_url) {
          window.location.href = response.data.redirect_url;
        } else {
          refetchSubscriptionPlans();
          refetchUserInfo();
        }
      }
    } catch (error) {
      showError(error);
    }
  };

  const PLAN_STATUSES = {
    TRIAL_PERIOD: 'trial_period',
    TRIAL_PENDING_PAYMENT_INFORMATION: 'trialing_pending_payment_information',
    ACTIVE: 'active',
    CANCELED: 'canceled',
    PAST_DUE: 'past_due',
  };

  const getSubscriptionDetailsByPlanStatus = price_option => {
    const status = price_option?.current_plan?.status;
    const actions = [];
    if (status === PLAN_STATUSES.ACTIVE) {
      actions.push(
        <Popconfirm
          title={`Are you sure to stop subscription?`}
          onConfirm={async () => {
            cancelPlan(price_option);
          }}
          okText="Yes"
          cancelText="No"
          placement="bottom"
        >
          <Button
            key="cancel"
            type="danger"
            loading={isUpdatingCancelStatus}
            icon={<StopOutlined />}
          >
            Stop Subscription
          </Button>
        </Popconfirm>
      );
    }

    if (!status || status === PLAN_STATUSES.CANCELED) {
      actions.push(
        <Button
          key="subscribe"
          type="primary"
          onClick={() => pickPlan({ plan: price_option })}
          loading={isUpdatingSubscribeStatus}
        >
          Subscribe
        </Button>
      );
    }

    actions.push(
      <Button
        disabled={!status}
        key="update-payment-method"
        type="primary"
        icon={<CreditCardOutlined />}
        onClick={() =>
          pickPlan({ plan: price_option, update_payment_info: true })
        }
      >
        Update Payment Method
      </Button>
    );

    return (
      <>
        <Card
          size="small"
          bodyStyle={{ textAlign: 'center' }}
          actions={actions}
          title={price_option.interval}
          extra={
            status === PLAN_STATUSES.ACTIVE ? (
              <Tag color="success" icon={<CheckCircleFilled />}>
                Active
              </Tag>
            ) : status === PLAN_STATUSES.CANCELED ? (
              <Tag color="error" icon={<StopFilled />}>
                Canceled
              </Tag>
            ) : (
              ''
            )
          }
        >
          <Statistic
            value={price_option.unit_amount}
            precision={2}
            prefix={'$'}
          />
        </Card>
        <div style={{ marginTop: '10px' }}>
          <Text type="secondary">
            {price_option?.current_plan?.status_message}
          </Text>
        </div>
      </>
    );
  };

  return (
    <Layout.Content style={{ padding: 20 }} className="subscription">
      <AppHeader />
      <Row justify="center">
        <Col xs={{ span: 24 }} lg={{ span: 20 }}>
          <Row style={{ marginBottom: 10 }}>
            <Col>
              <Link to={'/documents'}>
                <Button icon={<ArrowLeftOutlined />} type="link">
                  Documents
                </Button>
              </Link>
            </Col>
          </Row>
          <Spin spinning={fetchingSubscriptionPlans}>
            <Row
              justify="center"
              gutter={[10, 10]}
              style={{ overflow: 'auto', height: 'calc(100vh - 225px)' }}
            >
              <Col xs={{ span: 24 }} lg={{ span: 12 }}>
                {plan && (
                  <Card title={plan.name} size="large">
                    <Row gutter={32} justify="center">
                      {plan &&
                        plan.price_options.map((price_option, idx) => (
                          <Col key={idx} span={24} style={{ maxWidth: 500 }}>
                            {getSubscriptionDetailsByPlanStatus(price_option)}
                          </Col>
                        ))}
                    </Row>
                    {!!plan?.features?.length && (
                      <List
                        size="small"
                        header={<Title level={5}>Features</Title>}
                        dataSource={plan.features}
                        renderItem={feature => (
                          <List.Item>
                            <List.Item.Meta
                              avatar={
                                <CheckCircleFilled
                                  style={{ color: '#52c41a' }}
                                />
                              }
                              title={feature}
                            ></List.Item.Meta>
                          </List.Item>
                        )}
                      />
                    )}
                  </Card>
                )}
              </Col>
              <Col xs={{ span: 24 }} lg={{ span: 12 }}>
                <Card title="Enterprise">
                  <Typography.Paragraph>
                    With
                    <Typography.Link
                      href="https://nlmatics.com/"
                      target="_blank"
                    >
                      &nbsp;nlmatics&nbsp;
                    </Typography.Link>
                    Enterprise, you will get:
                  </Typography.Paragraph>
                  <Typography.Paragraph>
                    <ul>
                      <li>Bulk subscriptions</li>
                      <li>SOC2 compliance</li>
                    </ul>
                  </Typography.Paragraph>
                  <Typography.Paragraph>
                    Reach out to us at
                    <Typography.Link
                      type="link"
                      icon={<MailOutlined />}
                      href="mailto:onboarding@nlmatics.com"
                    >
                      &nbsp;onboarding@nlmatics.com
                    </Typography.Link>
                    .
                  </Typography.Paragraph>
                </Card>
              </Col>
            </Row>
          </Spin>
        </Col>
      </Row>
    </Layout.Content>
  );
}
