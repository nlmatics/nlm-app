import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Row, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useExtractionViews from '../../../../hooks/useExtractionViews';
import useFieldBundles from '../../fields/useFieldBundles';
import getFieldValue from './getFieldValue';
import useDocumentFieldsSummary from './useDocumentFieldsSummary';

export default function DocumentFieldsSummary({
  documentId,
  documentName,
  closeSummary,
}) {
  let { workspaceId } = useParams();
  const { defaultFieldBundleId } = useFieldBundles(workspaceId);
  const { data, isLoading } = useDocumentFieldsSummary({
    fieldBundleId: defaultFieldBundleId,
    documentId,
  });

  const [extractionViews, setExtractionViews] = useState([]);
  const { data: extractionViewsData, isLoading: isFetchingExtractionViews } =
    useExtractionViews(workspaceId);

  const [currentExtractionViewIndex, setCurrentExtractionViewIndex] =
    useState(0);

  useEffect(() => {
    if (!isFetchingExtractionViews && extractionViewsData) {
      setExtractionViews(
        extractionViewsData.filter(
          ({ options: { isVisualization } }) => !isVisualization
        )
      );
    }
  }, [extractionViewsData, isFetchingExtractionViews]);

  const getDataByView = currentExtractionViewIndex => {
    const currentExtractionView = extractionViews[currentExtractionViewIndex];

    const fields = currentExtractionView?.options?.columnState.filter(
      ({ hide }) => hide === false
    );
    const dataByView = fields?.flatMap(({ colId }) => {
      const field = data.find(({ topicId }) => topicId === colId);
      return field ? [field] : [];
    });
    return dataByView;
  };
  return (
    <Card
      loading={isLoading}
      size="small"
      bodyStyle={{
        padding: 20,
        height: 'calc(100vh - 239px)',
      }}
      actions={[
        <Button
          key="prev"
          disabled={currentExtractionViewIndex === 0}
          icon={<ArrowLeftOutlined />}
          onClick={() =>
            setCurrentExtractionViewIndex(currentExtractionViewIndex - 1)
          }
        >
          {extractionViews[currentExtractionViewIndex - 1]?.name}
        </Button>,
        <Button
          key="next"
          icon={<ArrowRightOutlined />}
          disabled={
            extractionViews.length === 0 ||
            currentExtractionViewIndex === extractionViews.length - 1
          }
          onClick={() =>
            setCurrentExtractionViewIndex(currentExtractionViewIndex + 1)
          }
        >
          {extractionViews[currentExtractionViewIndex + 1]?.name}
        </Button>,
      ]}
      extra={
        <Button
          style={{ marginLeft: 20 }}
          icon={<CloseOutlined />}
          onClick={() => closeSummary()}
        ></Button>
      }
      title={`Summary of ${documentName}`}
    >
      <Typography.Title level={3} style={{ textAlign: 'center' }}>
        {extractionViews[currentExtractionViewIndex]?.name}
      </Typography.Title>
      <Row
        gutter={[20, 20]}
        style={{ height: 'calc(100vh - 322px)', overflow: 'auto' }}
      >
        {!isFetchingExtractionViews &&
          data &&
          (getDataByView(currentExtractionViewIndex) || data)?.map(
            fieldDefinition => {
              const fieldSummary = getFieldValue({
                fieldDefinition: fieldDefinition,
                options: fieldDefinition.options,
                answerItem: fieldDefinition?.topic_facts[0],
              });
              return (
                <Col key={fieldDefinition.topicId} span={24}>
                  <Typography.Text type="secondary">
                    {fieldDefinition.topic}
                  </Typography.Text>
                  <Typography.Paragraph
                    style={{ marginTop: 0 }}
                    copyable={fieldSummary !== '-'}
                    ellipsis={{
                      rows: 5,
                      expandable: true,
                      symbol: 'more',
                    }}
                  >
                    {fieldSummary}
                  </Typography.Paragraph>
                </Col>
              );
            }
          )}
      </Row>
    </Card>
  );
}
