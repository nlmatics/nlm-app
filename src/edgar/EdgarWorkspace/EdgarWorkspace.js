import {
  CaretDownOutlined,
  FilePdfOutlined,
  LogoutOutlined,
  MailOutlined,
  PercentageOutlined,
  SearchOutlined,
  SwapOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Dropdown,
  Input,
  Layout,
  List,
  Row,
  Segmented,
  Typography,
  Divider,
  PageHeader,
  Alert,
  Result,
  Tooltip,
} from 'antd';
import moment from 'moment';
import { useCallback, useContext, useEffect, useState } from 'react';
import { Link, Route, Switch, useParams } from 'react-router-dom';
import fullLogoDarkTheme from '../../assets/images/nlmatics-logo-horizontal-black-bg.svg';
import fullLogoLightTheme from '../../assets/images/nlmatics-logo-horizontal-white-bg.svg';
import ThemeContext from '../../contexts/theme/ThemContext';
import useUserPermission from '../../hooks/useUserPermission';
import { useAuth } from '../../utils/use-auth';
import useWorkspaceById from '../hooks/useWorkspaceById';
import useDocuments from '../hooks/useDocuments';
import { getFormattedDateStringFromMomentDate } from '../../utils/dateUtils';
import DocumentContext from '../../contexts/document/DocumentContext';
import debounce from '../../utils/debounce';

import './index.less';
import useUserInfo from '../../hooks/useUserInfo';
import { subscribeToWorkspace } from '../hooks/mutator';
import WorkspaceSearch from '../../components/WorkspaceSearch';
import FieldFilters from '../../components/common/FieldFilters';
import UserFeedback from '../../chatty-pdf/components/UserFeedback/UserFeedback';
import SubscriptionOptions from '../../pages/Subscription/SubscriptionOptions';
import PlanAndUsage from '../../pages/PlanAndUsage/PlanAndUsage';
import FieldFiltersContext from '../../contexts/fieldFilters/FieldFiltersContext';
import useFieldBundles from '../../components/workspace/fields/useFieldBundles';
import useFilteredDocuments from '../../hooks/useFilteredDocuments';
import useSubscriptionPlans from '../hooks/useSubscriptionPlans';
import Trends from './Trends';
export default function EdgarWorkspace() {
  useUserPermission();
  const { workspaceId } = useParams();
  const { theme, THEMES, switchTheme, BRAND_COLOR } = useContext(ThemeContext);
  const { showDocument } = useContext(DocumentContext);
  const { signOut } = useAuth();
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [searchAcrossCount, setSearchAcrossCount] = useState(null);
  const [year, setYear] = useState('All');
  const [quarter, setQuarter] = useState('All');
  const [companyNameQuery, setCompanyNameQuery] = useState('');
  const {
    data: userInfo,
    useRefetchUserInfo,
    getSubscriptionById,
    isRestrictedWorkspace,
  } = useUserInfo();
  const refetchUserInfo = useRefetchUserInfo();

  const { getSubscriptionPlanById } = useSubscriptionPlans();
  const subscriptionPlan = getSubscriptionPlanById(workspaceId);
  const { data: repo } = useWorkspaceById(
    workspaceId,
    isRestrictedWorkspace(workspaceId)
  );
  const { data: documents, isLoading: isFetchingDocuments } = useDocuments(
    workspaceId,
    isRestrictedWorkspace(workspaceId)
  );

  const { fieldFilters } = useContext(FieldFiltersContext);
  const { defaultFieldBundleId } = useFieldBundles(
    workspaceId,
    isRestrictedWorkspace(workspaceId)
  );

  const {
    data: dataPointFilteredDocs,
    isLoading: isFetchingDataPointFilteredDocs,
  } = useFilteredDocuments({
    fieldBundleId: defaultFieldBundleId,
    filterModel: fieldFilters,
    workspaceId,
    isRestrictedWorkspace: isRestrictedWorkspace(workspaceId),
  });

  useEffect(() => {
    async function subscribe() {
      const { subscribedWorkspaces, restrictedWorkspaces } = userInfo;
      if (
        !subscribedWorkspaces.includes(workspaceId) &&
        !restrictedWorkspaces.includes(workspaceId)
      ) {
        await subscribeToWorkspace(workspaceId);
        refetchUserInfo();
      }
    }

    userInfo && workspaceId && subscribe();
  }, [userInfo, workspaceId]);

  useEffect(() => {
    if (documents?.length) {
      setFilteredDocuments(documents);
    }
  }, [documents]);

  useEffect(() => {
    document.title = `SEC nlmatics: ${repo?.name || ''}`;
  }, [repo?.name]);

  const getFilteredDocuments = useCallback(
    ({ companyName, year, quarter }) => {
      let companyNameMatched = true;
      let yearMatched = true;
      let quarterMatched = true;
      return documents?.filter(({ meta: { title, pubDate }, name }) => {
        if (companyName?.trim() !== '') {
          companyNameMatched = (title || name)
            ?.toLowerCase()
            ?.includes(companyName.toLowerCase());
        }
        if (year !== 'All') {
          yearMatched = pubDate?.startsWith(year);
        }
        if (quarter !== 'All') {
          quarterMatched = moment(pubDate).quarter() === quarter;
        }
        return yearMatched && companyNameMatched && quarterMatched;
      });
    },
    [documents]
  );

  useEffect(() => {
    const filteredDocs = getFilteredDocuments({
      companyName: companyNameQuery,
      year,
      quarter,
    });
    if (dataPointFilteredDocs) {
      const filteredDocIds = dataPointFilteredDocs?.results.map(
        ({ file_idx }) => file_idx
      );

      setFilteredDocuments(
        filteredDocs?.filter(({ id }) => filteredDocIds.includes(id))
      );
      setSearchAcrossCount(filteredDocIds?.length);
    } else {
      setSearchAcrossCount(null);
      if (!isFetchingDataPointFilteredDocs) {
        setFilteredDocuments(filteredDocs);
      }
    }
  }, [
    dataPointFilteredDocs,
    documents,
    getFilteredDocuments,
    companyNameQuery,
    year,
    quarter,
    isFetchingDataPointFilteredDocs,
  ]);

  useEffect(() => {
    if (!Object.keys(fieldFilters || {})?.length) {
      const filteredDocs = getFilteredDocuments({
        companyName: companyNameQuery,
        year,
        quarter,
      });
      setFilteredDocuments(filteredDocs);
    }
  }, [fieldFilters, getFilteredDocuments, companyNameQuery, year, quarter]);

  const handleSearch = debounce(query => {
    setCompanyNameQuery(query);
    setFilteredDocuments(
      getFilteredDocuments({
        companyName: query,
        year,
        quarter,
      })
    );
  }, 250);

  const getRestrictedWorkspaceWarning = workspaceId => (
    <Result
      status="warning"
      title="You do not have an active subscription."
      extra={
        <Link to={`/repository/${workspaceId}/subscribe`}>
          <Button type="primary">Subscribe Now</Button>
        </Link>
      }
    />
  );

  const subscription = getSubscriptionById(workspaceId);
  return (
    <Layout.Content
      style={{ padding: '5px 20px', overflow: 'auto' }}
      className="edgar-workspace"
    >
      <PageHeader
        className="edgar-workspace-header"
        style={{ padding: 0, minWidth: 984 }}
        subTitle={
          <Typography.Text type="secondary">{repo?.name}</Typography.Text>
        }
        tags={
          subscription &&
          subscription?.status !== 'active' &&
          subscription?.status !== 'trialing_active' && (
            <Tooltip
              title={
                subscriptionPlan?.price_options &&
                subscriptionPlan?.price_options[0]?.current_plan?.status_message
              }
            >
              <Link to={`/repository/${workspaceId}/subscribe`}>
                <Button type="primary" danger>
                  Subscribe
                </Button>
              </Link>
            </Tooltip>
          )
        }
        title={
          <Link to="/repositories">
            <img
              width={100}
              src={
                theme === THEMES.LIGHT ? fullLogoLightTheme : fullLogoDarkTheme
              }
              alt="EDGAR Logo"
            />
          </Link>
        }
        extra={
          <Row wrap={false}>
            <Col span={12}>
              {isRestrictedWorkspace(workspaceId) && (
                <Alert
                  message="You do not have an active subscription."
                  type="warning"
                  showIcon
                />
              )}
            </Col>
            <Col span={12} style={{ textAlign: 'right' }}>
              <Link to="/repositories">
                <Button type="link">Repositories</Button>
              </Link>
              <UserFeedback
                triggerButton={<Button type="link">Feedback</Button>}
              />
              <Dropdown
                trigger={['click']}
                menu={{
                  items: [
                    {
                      key: 'current-usage',
                      label: (
                        <Link to={`/repository/${workspaceId}/plan-and-usage`}>
                          <Button type="link" icon={<PercentageOutlined />}>
                            Current Plan & Usage
                          </Button>
                        </Link>
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
                          href="mailto:support@nlmatics.com"
                          style={{ color: BRAND_COLOR }}
                        >
                          Contact Support
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
                <Button type="link" icon={<UserOutlined />}>
                  <CaretDownOutlined style={{ marginLeft: 0 }} />
                </Button>
              </Dropdown>
            </Col>
          </Row>
        }
      >
        <Switch>
          <Route path={`/repository/:workspaceId/agreements`}>
            {isRestrictedWorkspace(workspaceId) ? (
              getRestrictedWorkspaceWarning(workspaceId)
            ) : (
              <Row justify="center" wrap={false} gutter={[10, 10]}>
                <Col span={6}>
                  <Link to={`/repository/${workspaceId}/search`}>
                    <Button
                      size="large"
                      style={{
                        marginBottom: 10,
                      }}
                      type="primary"
                      icon={<SearchOutlined />}
                    >
                      {`${'Search'} across ${
                        searchAcrossCount !== null
                          ? searchAcrossCount
                          : documents?.length || 'All'
                      } ${
                        searchAcrossCount === 1 ? 'Agreement' : 'Agreements'
                      }`}
                    </Button>
                  </Link>
                  <FieldFilters
                    workspaceId={workspaceId}
                    height="calc(100vh - 280px)"
                  />
                </Col>
                <Col span={18}>
                  <Card
                    size="small"
                    bodyStyle={{ minHeight: 'calc(100vh - 180px)' }}
                    title={
                      <Row gutter={[10, 10]} align="middle">
                        <Col span={8} style={{ textAlign: 'left' }}>
                          <Input
                            style={{ marginRight: 20, width: '100%' }}
                            defaultValue={companyNameQuery}
                            allowClear
                            placeholder="Find by company name"
                            addonBefore={<SearchOutlined />}
                            onChange={({ target: { value: query } }) => {
                              handleSearch(query);
                            }}
                          />
                        </Col>
                        <Col span={8} style={{ textAlign: 'center' }}>
                          Year:
                          <Segmented
                            size="small"
                            options={[
                              { label: 'All', value: 'All' },
                              { label: '2023', value: 2023 },
                              { label: '2022', value: 2022 },
                            ]}
                            value={year}
                            onChange={year => {
                              setYear(year);
                              setFilteredDocuments(
                                getFilteredDocuments({
                                  companyName: companyNameQuery,
                                  year,
                                  quarter,
                                })
                              );
                            }}
                          />
                        </Col>
                        <Col span={8} style={{ textAlign: 'right' }}>
                          Quarter:
                          <Segmented
                            size="small"
                            options={[
                              { label: 'All', value: 'All' },
                              { label: 'Q4', value: 4 },
                              { label: 'Q3', value: 3 },
                              { label: 'Q2', value: 2 },
                              { label: 'Q1', value: 1 },
                            ]}
                            value={quarter}
                            onChange={quarter => {
                              setQuarter(quarter);
                              setFilteredDocuments(
                                getFilteredDocuments({
                                  companyName: companyNameQuery,
                                  year,
                                  quarter,
                                })
                              );
                            }}
                          />
                        </Col>
                      </Row>
                    }
                  >
                    <Row wrap={false}>
                      <Col span={24}>
                        <List
                          pagination={
                            isFetchingDocuments ||
                            filteredDocuments?.length === 0
                              ? null
                              : {
                                  pageSize: 25,
                                  position: 'bottom',
                                  showSizeChanger: false,
                                }
                          }
                          rowKey="id"
                          loading={
                            isFetchingDocuments ||
                            isFetchingDataPointFilteredDocs
                          }
                          dataSource={filteredDocuments}
                          className="edgar-doc-list"
                          renderItem={({
                            meta: { title, pubDate, description },
                            name,
                            id,
                          }) => (
                            <List.Item>
                              <List.Item.Meta
                                avatar={<FilePdfOutlined />}
                                title={
                                  <Typography.Link
                                    onClick={() => {
                                      showDocument({
                                        documentId: id,
                                        documentTitle:
                                          title ||
                                          name ||
                                          'Document Title Missing',
                                      });
                                    }}
                                  >
                                    {title || name || 'Document Title Missing'}
                                  </Typography.Link>
                                }
                                description={description}
                              />
                              <span style={{ marginLeft: 10 }}>
                                <Typography.Text>
                                  {getFormattedDateStringFromMomentDate(
                                    moment(pubDate)
                                  )}
                                </Typography.Text>
                                <Divider type="vertical"></Divider>
                                <Typography.Text>{`Q${moment(
                                  pubDate
                                ).quarter()}`}</Typography.Text>
                              </span>
                            </List.Item>
                          )}
                        />
                      </Col>
                    </Row>
                  </Card>
                </Col>
              </Row>
            )}
          </Route>
          <Route path={`/repository/:workspaceId/search`}>
            {isRestrictedWorkspace(workspaceId) ? (
              getRestrictedWorkspaceWarning(workspaceId)
            ) : (
              <Row>
                <Col flex="auto" className="nlm-workspaceSearch">
                  <Row wrap={false} gutter={[10, 10]}>
                    <Col span={6}>
                      <Link to={`/repository/${workspaceId}/agreements`}>
                        <Button
                          size="large"
                          style={{
                            marginBottom: 10,
                          }}
                          type="primary"
                          icon={<FilePdfOutlined />}
                        >
                          Browse Agreements
                        </Button>
                      </Link>
                      <FieldFilters
                        workspaceId={workspaceId}
                        height="calc(100vh - 280px)"
                      />
                    </Col>
                    <Col span={18}>
                      <WorkspaceSearch
                        workspaceId={workspaceId}
                        mode="SEARCH"
                        height="calc(100vh - 240px)"
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>
            )}
          </Route>
          <Route exact path="/repository/:workspaceId/subscribe">
            <SubscriptionOptions workspaceId={workspaceId} />
          </Route>
          <Route exact path="/repository/:workspaceId/plan-and-usage">
            <PlanAndUsage workspaceId={workspaceId} />
          </Route>
          <Route exact path="/repository/:workspaceId/trends">
            <Trends workspaceId={workspaceId} fieldFilters={fieldFilters} />
          </Route>
        </Switch>
      </PageHeader>
    </Layout.Content>
  );
}
