import {
  Alert,
  Button,
  Card,
  Col,
  Layout,
  List,
  Pagination,
  Popover,
  Radio,
  Row,
  Space,
  Spin,
  Typography,
} from 'antd';
import { useContext, useEffect, useState } from 'react';
import SearchExtractionView from './SearchExtractionView';
import { WorkspaceContext } from './WorkspaceContext';
import WorkspaceSearchResult from './WorkspaceSearchResult';

import usePageHelper from '../pages/hooks/usePageHelper';
import {
  getAnswerTypesFromCriteria,
  questionTipsContent,
} from '../utils/helpers';
import { keywordsTips, questionTips } from './Tips';
import Search from './workspace/Search';
import useAdHocSearch from '../queries/useAdhocSearch';
import FieldFiltersContext from '../contexts/fieldFilters/FieldFiltersContext';
import useFieldBundles from './workspace/fields/useFieldBundles';
import useWorkspaceSearchPrompts from './workspace/useWorkspaceSearchPrompts';
import {
  ArrowRightOutlined,
  SearchOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const { Content } = Layout;
const { Meta } = Card;
const { Text } = Typography;

// TODO: Refactor to lower complexity
export default function WorkspaceSearch({ workspaceId, mode, from, height }) {
  // nosonar
  const workspaceContext = useContext(WorkspaceContext);
  const { isSearchPage } = usePageHelper();

  const [currentPage, setCurrentPage] = useState(1);
  const [answerTypes, setAnswerTypes] = useState(null);
  const [showOnlyTopAnswer, setShowOnlyTopAnswer] = useState(true);
  const [searchCriteria, setSearchCriteria] = useState(null);
  const {
    fieldFilters,
    setFieldFilters,
    setShowAppliedFilters,
    setOpenFieldFilters,
  } = useContext(FieldFiltersContext);
  const { defaultFieldBundleId } = useFieldBundles(workspaceId);
  const {
    data: workspaceSearchPrompts,
    isLoading: isFetchingWorkspaceSearchPrompts,
  } = useWorkspaceSearchPrompts(workspaceId);

  let fieldFilter;
  if (fieldFilters) {
    fieldFilter = {
      fieldBundleId: defaultFieldBundleId,
      filterModel: fieldFilters,
    };
  }

  const { runAdHocSearch, isLoading } = useAdHocSearch(
    workspaceId,
    'workspace',
    searchCriteria,
    workspaceContext,
    fieldFilter
  );

  useEffect(() => {
    if (from === 'search-home') {
      setSearchCriteria(workspaceContext.workspaceSearchCriteria);
      runAdHocSearch();
    }
  }, [from, workspaceContext.workspaceSearchCriteria]);

  useEffect(() => {
    workspaceContext.setWorkspaceSearchLoading(isLoading);
  }, [isLoading]);

  useEffect(() => {
    setCurrentPage(1);
  }, [workspaceContext.workspaceSearchCriteria]);

  useEffect(() => {
    if (
      workspaceContext.searchResults &&
      workspaceContext.searchResults.fileFacts &&
      workspaceContext.searchResults.fileFacts.length > 0
    ) {
      if (
        workspaceContext.searchResults.fileFacts[0].criterias.length > 0 &&
        workspaceContext.searchResults.fileFacts[0].criterias[0].is_question
      ) {
        let expectedAnswertypes = getAnswerTypesFromCriteria(
          workspaceContext.searchResults.fileFacts[0].criterias
        );
        setAnswerTypes(expectedAnswertypes);
      } else {
        setAnswerTypes(null);
      }
    } else {
      setAnswerTypes(null);
    }
  }, [workspaceContext.searchResults]);

  const handlePageChange = (page, pageSize) => {
    let searchCriteria = workspaceContext.workspaceSearchCriteria;
    setCurrentPage(page);
    searchCriteria.offset = (page - 1) * pageSize;
    searchCriteria.docPerPage = pageSize;
    setSearchCriteria(searchCriteria);
    runAdHocSearch();
  };

  // decides whether or not to display the grid
  const displayGrid = (
    <>
      {
        <SearchExtractionView
          workspaceId={workspaceId}
          answerTypes={answerTypes || []}
          searchCriteria={workspaceContext.workspaceSearchCriteria}
        ></SearchExtractionView>
      }
      {workspaceContext.searchResults.pagination &&
        workspaceContext.searchResults.pagination.length > 0 &&
        !workspaceContext.workspaceSearchLoading && (
          <Pagination
            className={'nlm-pagination'}
            size="small"
            defaultCurrent={1}
            current={currentPage}
            total={workspaceContext.searchResults.pagination[0].workspace.total}
            pageSize={workspaceContext.searchCriteriaDocPerPage}
            onChange={handlePageChange}
            onShowSizeChange={(current, size) =>
              workspaceContext.setSearchCriteriaDocPerPage(size)
            }
          />
        )}
    </>
  );

  const searchSummary = (
    <>
      <Row>
        <Col span={24}>{displayGrid}</Col>
      </Row>
    </>
  );

  const getQueryInfo = answerTypes =>
    answerTypes.length > 0 ? (
      <Text>
        Query expects <Text strong>{answerTypes[0]}</Text> as answer.
      </Text>
    ) : (
      <Text>
        Query expects keyword based intelligent search. Ask a question to get
        answers.
      </Text>
    );

  const searchHeader = (
    <>
      {workspaceContext.searchResults.pagination &&
        workspaceContext.searchResults.pagination.length > 0 && (
          <Card
            bodyStyle={{
              width: '100%',
              padding: '5px 10px',
              marginTop: isSearchPage ? 0 : 5,
            }}
            align="middle"
            className="nlm-workspaceSearch__header"
          >
            <Row justify="space-around" gutter={[10, 5]}>
              <Col span={12} style={{ textAlign: 'left' }}>
                {answerTypes && getQueryInfo(answerTypes)}
              </Col>
              <Col span={12} style={{ textAlign: 'right' }}>
                <b>
                  Found matches in{' '}
                  {workspaceContext.searchResults.pagination[0].workspace.total}{' '}
                  document
                  {workspaceContext.searchResults.pagination[0].workspace
                    .total > 1
                    ? 's'
                    : ''}
                  .
                </b>
              </Col>

              <Col span={12} style={{ textAlign: 'left' }}>
                {mode === 'SEARCH' && (
                  <Radio.Group
                    value={showOnlyTopAnswer}
                    defaultValue={showOnlyTopAnswer}
                    onChange={({ target: { value } }) => {
                      setShowOnlyTopAnswer(value);
                    }}
                    size="small"
                  >
                    <Radio value={true}>Show top answer</Radio>
                    <Radio value={false}>Show top 3 answers</Radio>
                  </Radio.Group>
                )}
              </Col>
              <Col span={12} style={{ textAlign: 'right' }}>
                <Text type="secondary">
                  Search results are grouped by document.
                </Text>
              </Col>
            </Row>
          </Card>
        )}
    </>
  );
  const isCriterionDefined = () =>
    !!workspaceContext?.workspaceSearchCriteria?.criterias[0]?.question;

  return (
    <>
      <Layout
        style={{
          alignItems:
            isSearchPage || (mode === 'EXTRACT' && isCriterionDefined())
              ? 'flex-start'
              : 'center',
          padding: isSearchPage ? 0 : 5,
        }}
      >
        <Layout.Content
          style={{
            padding: '0 5px',
            backgroundColor: 'inherit',
            width: '100%',
          }}
        >
          <Row
            className={isSearchPage ? 'nlm-sticky-search' : ''}
            gutter={[10, 10]}
          >
            <Col
              span={mode === 'EXTRACT' ? 7 : 24}
              style={{ position: 'relative' }}
            >
              <Search resetPagination={() => setCurrentPage(1)} mode={mode} />
            </Col>
            <Col span={mode === 'EXTRACT' ? 17 : 24}>
              {mode === 'EXTRACT' && answerTypes && getQueryInfo(answerTypes)}
              <Spin
                tip="Looking for answers..."
                spinning={workspaceContext.workspaceSearchLoading}
                style={{ paddingTop: '60vh', width: '100%' }}
              >
                <Content
                  style={{
                    display:
                      workspaceContext.searchResults.fileFacts.length > 0
                        ? 'block'
                        : 'none',
                  }}
                >
                  <div
                    style={{
                      display: mode === 'EXTRACT' ? 'block' : 'none',
                    }}
                  >
                    {searchSummary}
                  </div>
                  <div
                    style={{
                      display: mode === 'SEARCH' ? 'block' : 'none',
                    }}
                  >
                    {searchHeader}
                    <WorkspaceSearchResult
                      workspaceId={workspaceId}
                      answerTypes={answerTypes || []}
                      showOnlyTopAnswer={showOnlyTopAnswer}
                      height={height}
                    ></WorkspaceSearchResult>
                    {workspaceContext.searchResults.pagination &&
                      workspaceContext.searchResults.pagination.length > 0 &&
                      !workspaceContext.workspaceSearchLoading && (
                        <Pagination
                          className={'nlm-pagination'}
                          size="small"
                          defaultCurrent={1}
                          current={currentPage}
                          total={
                            workspaceContext.searchResults.pagination[0]
                              .workspace.total
                          }
                          pageSize={workspaceContext.searchCriteriaDocPerPage}
                          onChange={handlePageChange}
                          onShowSizeChange={(current, size) =>
                            workspaceContext.setSearchCriteriaDocPerPage(size)
                          }
                        />
                      )}
                  </div>
                </Content>
                <Content
                  style={{
                    display:
                      workspaceContext.searchResults.fileFacts.length > 0
                        ? 'none'
                        : 'block',
                  }}
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Alert
                      style={{
                        display: workspaceContext.searchResults.empty
                          ? 'block'
                          : 'none',
                        paddingBottom: '10px',
                      }}
                      message="No results found. Please refine your query."
                      type="error"
                    />
                    {workspaceSearchPrompts?.length ||
                    isFetchingWorkspaceSearchPrompts ? (
                      <Row justify="center">
                        <Col span={22}>
                          <Typography.Paragraph style={{ textAlign: 'center' }}>
                            Click on <SettingOutlined /> for Advance Search.
                          </Typography.Paragraph>

                          <List
                            loading={isFetchingWorkspaceSearchPrompts}
                            size="small"
                            header=" Try sample search examples."
                            dataSource={workspaceSearchPrompts}
                            renderItem={({
                              searchCriteria,
                              title,
                              subtitle,
                            }) => (
                              <List.Item
                                actions={[
                                  <Button
                                    key="run-search"
                                    icon={<SearchOutlined />}
                                    onClick={() => {
                                      workspaceContext.setWorkspaceSearchCriteria(
                                        searchCriteria
                                      );
                                      setSearchCriteria(searchCriteria);
                                      setFieldFilters(
                                        searchCriteria?.fieldFilter?.filterModel
                                      );
                                      if (
                                        searchCriteria?.fieldFilter?.filterModel
                                      ) {
                                        setShowAppliedFilters(true);
                                        setOpenFieldFilters(
                                          Object.keys(
                                            searchCriteria?.fieldFilter
                                              ?.filterModel
                                          )
                                        );
                                      }
                                      setTimeout(() => runAdHocSearch());
                                    }}
                                  >
                                    Run Search
                                  </Button>,
                                ]}
                              >
                                <List.Item.Meta
                                  avatar={<ArrowRightOutlined />}
                                  title={title}
                                  description={subtitle}
                                ></List.Item.Meta>
                              </List.Item>
                            )}
                          />
                        </Col>
                      </Row>
                    ) : (
                      <Card
                        bodyStyle={{ padding: 10 }}
                        title={
                          <Typography.Title
                            level={5}
                            style={{ textAlign: 'center' }}
                          >
                            Type in your query above to search and find answers.
                          </Typography.Title>
                        }
                      >
                        <Row gutter={8}>
                          <Col span={12}>
                            {workspaceContext.currentWorkspace?.settings && (
                              <Card
                                bodyStyle={{ padding: 10 }}
                                type="inner"
                                title="Example Questions"
                                extra={
                                  workspaceContext.currentWorkspace?.settings
                                    ?.domain === 'general' ? (
                                    <>
                                      <Popover
                                        content={questionTipsContent}
                                        title="Tips"
                                      >
                                        More Tips
                                      </Popover>
                                    </>
                                  ) : (
                                    <></>
                                  )
                                }
                              >
                                <Meta description="Use to extract answers"></Meta>
                                <div style={{ marginTop: '30px' }}>
                                  {workspaceContext.currentWorkspace?.settings
                                    ?.domain === 'biology'
                                    ? questionTips.biomedical
                                    : questionTips.general}
                                </div>
                              </Card>
                            )}
                          </Col>
                          <Col span={12}>
                            {workspaceContext.currentWorkspace?.settings && (
                              <Card
                                type="inner"
                                title="Example Keywords"
                                bodyStyle={{ padding: 10 }}
                              >
                                <Meta description="Use for intelligent search"></Meta>
                                <div style={{ marginTop: '30px' }}>
                                  {workspaceContext.currentWorkspace?.settings
                                    ?.domain === 'biology'
                                    ? keywordsTips.biomedical
                                    : keywordsTips.general}
                                </div>
                              </Card>
                            )}
                          </Col>
                        </Row>
                      </Card>
                    )}
                  </Space>
                </Content>
              </Spin>
            </Col>
          </Row>
        </Layout.Content>
      </Layout>
    </>
  );
}
