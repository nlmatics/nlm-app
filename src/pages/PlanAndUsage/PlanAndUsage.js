import { useState, useEffect, useContext } from 'react';

import { Spin, Row, Col, Card, Table, PageHeader, Layout, Button } from 'antd';
import { Link } from 'react-router-dom';

import { getUsageMetrics } from '../../utils/apiCalls.js';
import { formatNumericText } from '../../utils/valueFormatters';
import useUserInfo from '../../hooks/useUserInfo.js';
import AppContext from '../../contexts/app/AppContext.js';
import { ArrowLeftOutlined } from '@ant-design/icons';

export default function PlanAndUsage({ workspaceId }) {
  const [loading, setLoading] = useState(false);
  const [generalStats, setGeneralStats] = useState([]);
  const [apiStats, setAPIStats] = useState();
  const [planName, setPlanName] = useState('');
  const { data: userInfo } = useUserInfo();
  const { isChattyPdf, isEDGAR } = useContext(AppContext);

  useEffect(() => {
    (async () => {
      setLoading(true);
      let metrics = await getUsageMetrics();
      if (metrics.length > 0) {
        setAPIStats(metrics[0].dev_api_usage);
        if (isChattyPdf()) {
          setGeneralStats(
            metrics[0].general_usage.filter(({ catalog_id }) =>
              ['num_docs', 'num_pages', 'doc_size', 'num_search'].includes(
                catalog_id
              )
            )
          );
        } else {
          setGeneralStats(metrics[0].general_usage);
        }
        setPlanName(metrics[0].subscription_detail);
        console.log(apiStats, generalStats);
      }
      setLoading(false);
    })();
  }, []);

  const columns = [
    {
      title: 'Feature',
      dataIndex: 'feature',
      key: 'feature',
    },
    {
      title: 'Used',
      dataIndex: 'used',
      key: 'used',
      align: 'right',
      render: text => <span>{formatNumericText(text)}</span>,
    },
    {
      title: 'Quota',
      dataIndex: 'quota',
      key: 'quota',
      align: 'right',
      render: text => <span>{formatNumericText(text)}</span>,
    },
    {
      title: 'Percent Used',
      dataIndex: 'percentUsed',
      key: 'percentUsed',
      align: 'right',
    },
  ];
  return (
    <Spin spinning={loading}>
      <PageHeader
        title={`Plan Name: ${planName}`}
        extra={
          userInfo &&
          userInfo?.canChangeSubscription &&
          (isChattyPdf() || isEDGAR()) && (
            <Link
              to={
                isChattyPdf()
                  ? '/subscribe'
                  : `/repository/${workspaceId}/subscribe`
              }
            >
              <Button type="primary">Manage Subscription</Button>
            </Link>
          )
        }
        backIcon={
          isChattyPdf() ? (
            <Link to={'/documents'}>
              <Button icon={<ArrowLeftOutlined />} type="link">
                Documents
              </Button>
            </Link>
          ) : (
            <Link to={`/repository/${workspaceId}/agreements`}>
              <Button type="link" icon={<ArrowLeftOutlined />}>
                Repository
              </Button>
            </Link>
          )
        }
        onBack={() => {}}
      >
        <Layout.Content>
          <Row gutter={[10, 10]}>
            <Col span={isChattyPdf() || !apiStats ? 24 : 12}>
              <Card title={'Application'} size="small">
                <Table
                  dataSource={generalStats}
                  columns={columns}
                  style={{ width: '100%' }}
                  pagination={false}
                ></Table>
              </Card>
            </Col>
            {!isChattyPdf() && apiStats && (
              <Col span={12}>
                <Card title={'Developer API'} size="small">
                  <Table
                    dataSource={apiStats}
                    columns={columns}
                    style={{ width: '100%' }}
                    pagination={false}
                  ></Table>
                </Card>
              </Col>
            )}
          </Row>
        </Layout.Content>
      </PageHeader>
    </Spin>
  );
}
