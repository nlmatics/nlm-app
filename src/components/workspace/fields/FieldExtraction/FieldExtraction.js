import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Layout, Row, Spin, Steps, Typography } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import useAdHocSearch from '../../../../queries/useAdhocSearch';
import { getFieldDefinition } from '../../../../utils/apiCalls';
import SearchSaver from '../../../SearchSaver';
import { WorkspaceContext } from '../../../WorkspaceContext';
import SearchCriteria from '../SearchCriteria';

import './index.less';
import { isSearchApplied } from '../../../../utils/helpers';

const STEPS = {
  SEARCH_REVIEW: 0,
  SAVE: 1,
};
export default function FieldExtraction() {
  const { workspaceId, fieldId } = useParams();
  const history = useHistory();
  const location = useLocation();
  const from = location?.state?.from;
  const workspaceSearchCriteria = location?.state?.workspaceSearchCriteria;
  const [currentStep, setCurrentStep] = useState(STEPS.SEARCH_REVIEW);
  const [fieldDefinition, setFieldDefinition] = useState(null);
  const [isFetchingFieldDefinition, setIsFetchingFieldDefinition] =
    useState(false);
  const [question, setQuestion] = useState('');
  const workspaceContext = useContext(WorkspaceContext);
  let level = 'workspace';
  const [querySearchCriteria, setQuerySearchCriteria] = useState(
    workspaceSearchCriteria
  );
  const { runAdHocSearch, isLoading } = useAdHocSearch(
    workspaceId,
    level,
    querySearchCriteria,
    workspaceContext
  );

  useEffect(() => {
    workspaceContext.setWorkspaceSearchLoading(isLoading);
  }, [isLoading]);

  useEffect(() => {
    if (workspaceSearchCriteria) {
      workspaceContext.setWorkspaceSearchCriteria(workspaceSearchCriteria);
      runAdHocSearch();
    }
  }, [workspaceSearchCriteria]);

  useEffect(() => {
    async function fetchFieldDefinition() {
      setIsFetchingFieldDefinition(true);
      const fieldDefinition = await getFieldDefinition(
        fieldId,
        workspaceContext.setFieldEditData
      );
      setFieldDefinition(fieldDefinition);
      setQuerySearchCriteria(fieldDefinition.searchCriteria);
      workspaceContext.setSearchResultsVisible(
        !workspaceContext.workspaceSearchMode
      );
      workspaceContext.setWorkspaceSearchCriteria(
        fieldDefinition.searchCriteria
      );
      runAdHocSearch();
      setIsFetchingFieldDefinition(false);
    }
    if (fieldId && workspaceId) {
      fetchFieldDefinition();
    }
  }, []);

  useEffect(() => {
    if (
      workspaceContext.workspaceSearchCriteria &&
      workspaceContext.workspaceSearchCriteria.criterias
    ) {
      let criteriaQuestion =
        workspaceContext.workspaceSearchCriteria.criterias[0].question;
      setQuestion(criteriaQuestion);
    } else {
      setQuestion('');
    }
  }, [workspaceContext.workspaceSearchCriteria]);

  return (
    <Layout className="nlm-fieldExtraction">
      <Card size="small" bodyStyle={{ height: 'calc(100vh - 125px)' }}>
        <Row
          gutter={[10, 10]}
          align="middle"
          wrap={false}
          justify="space-between"
          style={{ marginBottom: 6 }}
        >
          <Col style={{ textAlign: 'center' }}>
            <Typography.Title level={5} style={{ margin: 0 }}>
              {workspaceContext?.fieldEditData?.name
                ? `Refine field ${workspaceContext.fieldEditData.name}`
                : 'Create a new Data Field'}
            </Typography.Title>
          </Col>

          <Col>
            <Steps current={currentStep} direction="horizontal" size="small">
              <Steps.Step title="Search & Review" />
              <Steps.Step title="Save" />
            </Steps>
          </Col>

          <Col flex="220px">
            <Button
              icon={<ArrowLeftOutlined />}
              hidden={currentStep === STEPS.SEARCH_REVIEW}
              key="previous"
              onClick={() => setCurrentStep(STEPS.SEARCH_REVIEW)}
            >
              Search & Review
            </Button>
            <Button
              type="primary"
              icon={<ArrowRightOutlined />}
              hidden={currentStep === STEPS.SAVE}
              style={{ minWidth: 95, marginRight: 10 }}
              disabled={
                !isSearchApplied(workspaceContext?.workspaceSearchCriteria)
              }
              key="next"
              onClick={() => {
                setCurrentStep(STEPS.SAVE);
                workspaceContext.setFieldEditData(fieldDefinition);
              }}
            >
              Save
            </Button>
            {fieldId && (
              <Button
                type="primary"
                icon={<ArrowRightOutlined />}
                hidden={currentStep === STEPS.SAVE}
                style={{ minWidth: 95 }}
                disabled={
                  !isSearchApplied(workspaceContext?.workspaceSearchCriteria)
                }
                key="next"
                onClick={() => {
                  setCurrentStep(STEPS.SAVE);
                  workspaceContext.setFieldEditData(null);
                }}
              >
                Save As
              </Button>
            )}
          </Col>
          <Col flex="30px">
            <Button
              size="small"
              icon={<CloseOutlined />}
              onClick={() => history.goBack()}
            ></Button>
          </Col>
        </Row>
        <Row>
          <Col
            span={24}
            style={{
              overflow: 'auto',
              width: 'min-content',
            }}
          >
            <Spin spinning={isFetchingFieldDefinition}>
              {currentStep === STEPS.SEARCH_REVIEW && <SearchCriteria />}
              {currentStep === STEPS.SAVE && (
                <SearchSaver
                  workspaceId={workspaceId}
                  question={question}
                  from={from}
                />
              )}
            </Spin>
          </Col>
        </Row>
      </Card>
    </Layout>
  );
}
