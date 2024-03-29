import {
  Button,
  Card,
  Col,
  Grid,
  Layout,
  Row,
  Spin,
  Table,
  Typography,
} from 'antd';
import { useContext, useEffect, useState } from 'react';
import nlmaticsLogoDarkTheme from '../../assets/images/nlmatics-logo-horizontal-black-bg.svg';
import nlmaticsLogoLightTheme from '../../assets/images/nlmatics-logo-horizontal-white-bg.svg';
import AggregateFieldChart from '../../components/workspace/visualizations/AggregateFieldChart';
import ThemeContext from '../../contexts/theme/ThemContext';
import columns from './columns';
import { DatabaseOutlined } from '@ant-design/icons';
import './index.less';
import data from './trends.json';

const getTopDeals = ({ deals, byColumn, valueColumn, by }) =>
  deals.results
    .flatMap(result =>
      result[byColumn].answer_details.raw_value &&
      result[byColumn].answer_details.raw_value !== 'Other'
        ? [
            {
              deals: result.child_total,
              amount: result[valueColumn].answer_details.raw_value,
              [by]: result[byColumn].answer_details.raw_value,
            },
          ]
        : []
    )
    .sort((a, b) => (a.amount > b.amount ? -1 : 1))
    .slice(0, 5);

const getAggregateFieldChartData = (data, fieldId, valueCols) => {
  const columnChartData = valueCols?.flatMap(({ field: colId }) => {
    return data
      ?.flatMap(result =>
        result[colId].answer_details.raw_value &&
        result[fieldId].answer_details.raw_value &&
        result[fieldId].answer_details.raw_value !== 'Other'
          ? {
              groupFieldValue: result[fieldId].answer_details.raw_value,
              aggField: 'Amount',
              value: result[colId].answer_details.raw_value,
            }
          : []
      )
      .sort((a, b) => (a.value > b.value ? -1 : 1))
      .slice(0, 10);
  });
  return data ? columnChartData : [];
};
export default function Trends() {
  const { theme, THEMES } = useContext(ThemeContext);
  const { useBreakpoint } = Grid;
  const [trendsData, setTrendsData] = useState({});
  const breakpoints = useBreakpoint();

  useEffect(() => {
    document.title = 'nlmatics: Credit Agreement Trends';
  }, []);

  useEffect(() => {
    window?.gtag('event', 'page_view');
  }, []);

  useEffect(() => {
    const myRequest = new Request(
      `https://chattypdf.blob.core.windows.net/sec-trends/trends.json?trends=${Date.now()}`
    );

    fetch(myRequest)
      .then(response => response.json())
      .then(trendsData => {
        setTrendsData(trendsData);
      })
      .catch(() => {
        setTrendsData(data);
      });
  }, []);

  const {
    recentDeals,
    dealsByIndustry,
    dealsBySector,
    dealsByBorrowerCounsel,
    dealsByAgentCounsel,
    dealsByAdministrativeAgent,
  } = trendsData;

  if (!trendsData.recentDeals) {
    return (
      <Layout style={{ justifyContent: 'center' }}>
        <img
          src={
            theme === THEMES.LIGHT
              ? nlmaticsLogoLightTheme
              : nlmaticsLogoDarkTheme
          }
          alt={'nlmatics Logo'}
          style={{ width: 200, minWidth: 200, margin: '0 auto' }}
        />
        <Spin />
      </Layout>
    );
  }

  const topDeals = [
    {
      title: 'By Borrower Counsel',
      table: (
        <Table
          size="small"
          dataSource={getTopDeals({
            deals: dealsByBorrowerCounsel,
            byColumn: 'a7632fab-9dd1-4a9a-bfad-b7e3edde2f7f',
            valueColumn: '68e7e09d',
            by: 'borrowerCounsel',
          })}
          columns={columns.dealsByBorrowerCounsel}
          pagination={false}
        />
      ),
      chart: (
        <AggregateFieldChart
          chartData={getAggregateFieldChartData(
            dealsByBorrowerCounsel.results,
            'a7632fab-9dd1-4a9a-bfad-b7e3edde2f7f',
            [
              {
                field: '68e7e09d',
              },
            ]
          )}
        />
      ),
    },
    {
      title: 'By Agent Counsel',
      table: (
        <Table
          size="small"
          dataSource={getTopDeals({
            deals: dealsByAgentCounsel,
            byColumn: '4a768eae-5302-441e-bd80-b916da5f864c',
            valueColumn: '68e7e09d',
            by: 'agentCounsel',
          })}
          columns={columns.dealsByAgentCounsel}
          pagination={false}
        />
      ),
      chart: (
        <AggregateFieldChart
          chartData={getAggregateFieldChartData(
            dealsByAgentCounsel.results,
            '4a768eae-5302-441e-bd80-b916da5f864c',
            [
              {
                field: '68e7e09d',
              },
            ]
          )}
        />
      ),
    },
    {
      title: 'By Administrative Agent',
      table: (
        <Table
          size="small"
          dataSource={getTopDeals({
            deals: dealsByAdministrativeAgent,
            byColumn: 'db4a3d94-f466-4478-be5c-93fa927e293c',
            valueColumn: '68e7e09d',
            by: 'administrativeAgent',
          })}
          columns={columns.dealsByAdministrativeAgent}
          pagination={false}
        />
      ),
      chart: (
        <AggregateFieldChart
          chartData={getAggregateFieldChartData(
            dealsByAdministrativeAgent.results,
            'db4a3d94-f466-4478-be5c-93fa927e293c',
            [
              {
                field: '68e7e09d',
              },
            ]
          )}
        />
      ),
    },
    {
      title: 'By Industry',
      chart: (
        <AggregateFieldChart
          chartData={getAggregateFieldChartData(
            dealsByIndustry.results,
            '9d4e414b',
            [
              {
                field: '68e7e09d',
              },
            ]
          )}
        />
      ),
      table: (
        <Table
          size="small"
          dataSource={getTopDeals({
            deals: dealsByIndustry,
            byColumn: '9d4e414b',
            valueColumn: '68e7e09d',
            by: 'industry',
          })}
          columns={columns.dealsByIndustry}
          pagination={false}
        />
      ),
    },
    {
      title: 'By Sector',
      chart: (
        <AggregateFieldChart
          chartData={getAggregateFieldChartData(
            dealsBySector.results,
            'efcb538d',
            [
              {
                field: '68e7e09d',
              },
            ]
          )}
        />
      ),
      table: (
        <Table
          size="small"
          dataSource={getTopDeals({
            deals: dealsBySector,
            byColumn: 'efcb538d',
            valueColumn: '68e7e09d',
            by: 'sector',
          })}
          columns={columns.dealsBySector}
          pagination={false}
        />
      ),
    },
  ];

  return (
    <Layout
      style={{ overflow: 'auto', height: '100vh' }}
      className="credit-agreement-trends"
    >
      <Row align="middle" justify="center" style={{ margin: 10 }}>
        <Col span={22}>
          <Row justify="center" align="middle">
            <Col span={24}>
              <Row justify="center" style={{ marginBottom: 5 }}>
                <Col span={20} style={{ textAlign: 'left' }}>
                  <a
                    href="https://www.nlmatics.com/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      src={
                        theme === THEMES.LIGHT
                          ? nlmaticsLogoLightTheme
                          : nlmaticsLogoDarkTheme
                      }
                      alt={'nlmatics Logo'}
                      style={{ width: 100, minWidth: 100 }}
                    />
                  </a>
                </Col>

                <Col span={4} style={{ textAlign: 'right' }}>
                  <Button
                    type="primary"
                    href="https://www.nlmatics.com/apps/sec-credit-agreements"
                    target="_blank"
                    icon={<DatabaseOutlined />}
                  >
                    {!breakpoints.xs && 'SEC Clause Repository'}
                  </Button>
                </Col>
              </Row>
              <Row gutter={[10, 10]} justify="center">
                <Col span={4}>
                  <Typography.Title level={5} style={{ margin: 0 }}>
                    Credit Agreement Trends
                  </Typography.Title>
                </Col>
                <Col span={16} style={{ textAlign: 'center' }}>
                  <Typography.Title level={5} style={{ margin: 0 }}>
                    Recent Deals
                  </Typography.Title>
                </Col>
                <Col span={4}></Col>
                <Col span={24} style={{ textAlign: 'center' }}>
                  <Table
                    size="small"
                    dataSource={recentDeals.documents.map(
                      ({
                        meta: { title, url, pubDate, type, description },
                        fieldValues: {
                          ['68e7e09d']: {
                            answer_details: { raw_value: coverAmount } = {
                              raw_value: '',
                            },
                          },
                          ['abb08595-e1b8-4537-8960-6d2d7b28dea7']: {
                            answer: agreementType,
                          },
                          ['dc2e8920']: { answer: amendmentNumber },
                          ['db4a3d94-f466-4478-be5c-93fa927e293c']: {
                            answer_details: {
                              raw_value: administrativeAgent,
                            } = { raw_value: '-' },
                          },
                        },
                      }) => ({
                        title,
                        url,
                        pubDate,
                        type,
                        description,
                        coverAmount,
                        agreementType,
                        amendmentNumber,
                        administrativeAgent,
                      })
                    )}
                    columns={columns.recentDeals}
                    pagination={false}
                  />
                </Col>
                <Col span={24} style={{ textAlign: 'center' }}>
                  <Typography.Title level={5} style={{ margin: 0 }}>
                    Top Deals in last 30 days
                  </Typography.Title>
                </Col>
                {topDeals.map(({ title, chart, table }) => (
                  <Col xs={{ span: 24 }} lg={{ span: 8 }} key={title}>
                    <Card size="small" title={title} cover={chart}>
                      {table}
                    </Card>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        </Col>
      </Row>
    </Layout>
  );
}
