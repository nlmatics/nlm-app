import {
  ArrowRightOutlined,
  InfoCircleOutlined,
  MinusOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Collapse,
  Layout,
  Row,
  Space,
  Spin,
  Tooltip,
  Typography,
} from 'antd';
import { useContext, useState } from 'react';
import { WorkspaceContext } from '../../../../components/WorkspaceContext';
import useFieldBundleExtractionDataForDoc from '../../../../components/workspace/Document/DocInfoViewer/useFieldBundleExtractionDataForDoc';
import getFieldValue from '../../../../components/workspace/documents/DocumentFieldsSummary/getFieldValue';
import useFieldBundles from '../../../../components/workspace/fields/useFieldBundles';
import ThemeContext from '../../../../contexts/theme/ThemContext';
import useViews from '../../../../hooks/useViews';
const { Panel } = Collapse;
export default function DocumentDataPoints({ documentId, workspaceId }) {
  const { BRAND_COLOR } = useContext(ThemeContext);
  const workspaceContext = useContext(WorkspaceContext);
  const { getViews, isLoading: isFetchingViews } = useViews(workspaceId);
  const { defaultFieldBundleId } = useFieldBundles(workspaceId);
  const { data: questions = [], isLoading: isFetchingQnA } =
    useFieldBundleExtractionDataForDoc({
      fieldBundleId: defaultFieldBundleId,
      documentId,
    });
  const [revealedDataPoints, setRevealedDataPoints] = useState(
    localStorage.getItem('nlm-revealed-data-points') === 'true'
  );
  const [hilightedInPdfId, setHilightedInPdfId] = useState(null);
  return (
    <Layout style={{ position: 'relative' }}>
      <Spin
        spinning={isFetchingQnA || isFetchingViews}
        tip="Getting Data Points"
      >
        <Collapse
          ghost
          defaultActiveKey={[getViews() && getViews()[0]?.id]}
          style={{ minHeight: 100 }}
        >
          {getViews()?.map(({ name, id, options: { columnState } }) => (
            <Panel header={name} key={id}>
              <Row gutter={[5, 5]}>
                {columnState?.slice(1)?.map(({ colId }) => {
                  const question = questions.find(
                    ({ topicId }) => topicId === colId
                  );
                  if (!question || !question.topic_facts[0]) {
                    return null;
                  }
                  const {
                    topic,
                    isEnteredField,
                    topic_facts: [topicFact],
                  } = question;
                  const dataPoint = getFieldValue({
                    fieldDefinition: question,
                    options: question.options,
                    answerItem: topicFact,
                  });

                  const getPointAnswer = (dataPoint, topicFact) => {
                    let dataPointAnswer = 'Could not get an answer.';
                    // Avoid noise by not showing answers with less accuracy score
                    if (topicFact?.scaled_score * 100 < 65) {
                      return null;
                    }
                    if (dataPoint === '+') {
                      if (topicFact?.criteria_question) {
                        // no point answer present.
                        dataPointAnswer = null;
                      } else {
                        // it is a definition field with must have and without question
                        // so get entire phrase as definition
                        dataPointAnswer = topicFact?.phrase;
                      }
                    } else {
                      dataPointAnswer = dataPoint;
                    }
                    return dataPointAnswer;
                  };
                  const isCopyable =
                    (dataPoint !== '+' && dataPoint !== '-') ||
                    !topicFact?.criteria_question;
                  const pointAnswer = getPointAnswer(dataPoint, topicFact);
                  return (
                    <Col key={colId} span={24}>
                      <Card
                        size="small"
                        bodyStyle={{
                          padding: 10,
                          ...(hilightedInPdfId === colId
                            ? { borderRight: `3px solid ${BRAND_COLOR}` }
                            : {}),
                        }}
                      >
                        <Row wrap={false}>
                          <Col flex="auto">
                            <Typography.Text type="secondary">
                              {topic}
                              {topicFact?.criteria_question && (
                                <Tooltip title={topicFact?.criteria_question}>
                                  <InfoCircleOutlined
                                    style={{ marginLeft: 5 }}
                                  />
                                </Tooltip>
                              )}
                            </Typography.Text>
                          </Col>
                          <Col
                            flex="25px"
                            style={{
                              ...(hilightedInPdfId === colId
                                ? { marginRight: -3 }
                                : {}),
                            }}
                          >
                            {pointAnswer && !isEnteredField && (
                              <Tooltip title="Show in document">
                                <Button
                                  size="small"
                                  icon={<ArrowRightOutlined />}
                                  type="link"
                                  onClick={() => {
                                    setHilightedInPdfId(colId);
                                    workspaceContext.setSearchPDF([
                                      topicFact['page_idx'],
                                      {
                                        selectedBlock: topicFact,
                                        phraseSearch: true,
                                        caseSensitive: false,
                                        entireWord: false,
                                        highlightAll: false,
                                        findPrevious: undefined,
                                      },
                                    ]);
                                  }}
                                ></Button>
                              </Tooltip>
                            )}
                          </Col>
                        </Row>
                        <Row wrap={false} style={{ marginTop: 5 }}>
                          <Col span={24}>
                            <Typography.Paragraph
                              copyable={isCopyable}
                              ellipsis={{
                                rows: 5,
                                expandable: true,
                                symbol: 'more',
                              }}
                              style={{ marginBottom: 0 }}
                            >
                              {pointAnswer || (
                                <>
                                  <Row gutter={[5, 5]}>
                                    <Col span={24}>
                                      <Tooltip title="Could not get an exact answer.">
                                        <MinusOutlined />
                                      </Tooltip>
                                    </Col>
                                  </Row>
                                </>
                              )}
                            </Typography.Paragraph>
                          </Col>
                        </Row>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </Panel>
          ))}
        </Collapse>
      </Spin>
      {!revealedDataPoints && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 3,
            backgroundColor: `${BRAND_COLOR}`,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'top',
            width: '100%',
            height: '100%',
            minHeight: 'calc(100vh - 237px)',
            padding: 20,
            textAlign: 'center',
          }}
        >
          {
            <Space direction="vertical" size="large">
              <Typography.Text style={{ color: '#FFF' }}>
                AI extracted data points.
              </Typography.Text>
              <Button
                onClick={() => {
                  localStorage.setItem('nlm-revealed-data-points', true);
                  setRevealedDataPoints(true);
                }}
              >
                Show Data Points
              </Button>
            </Space>
          }
        </div>
      )}
    </Layout>
  );
}
