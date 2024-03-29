import {
  useState,
  useContext,
  useEffect,
  useCallback,
  Suspense,
  lazy,
} from 'react';
import {
  Form,
  Button,
  Row,
  Col,
  Spin,
  Pagination,
  Typography,
  Space,
  Popconfirm,
  Card,
} from 'antd';
import {
  CloseOutlined,
  ClearOutlined,
  SaveOutlined,
  SearchOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { WorkspaceContext } from './WorkspaceContext';
import {
  clearRelationSearchCriteria,
  createAdHocSearch,
} from '../utils/helpers';
import RelationExtractionView from './RelationExtractionView';
import SaveRelationModal from './SaveRelationModal';
import { relationtypes, searchCriteriaDefaults } from '../utils/constants.js';
import { showError } from '../utils/apiCalls';
import API from '../utils/API';
import useAdHocSearch from '../queries/useAdhocSearch.js';
const RelationCriteriaForm = lazy(() => import('./RelationCriteriaForm.js'));
const { Title, Text } = Typography;

export default function RelationEditor({
  workspaceId,
  selectedRelation,
  onClose,
  onEdited,
  onVisualize,
  relationType,
}) {
  const workspaceContext = useContext(WorkspaceContext);
  const [loading, setLoading] = useState(false);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(
    searchCriteriaDefaults.RELATIONS_PER_PAGE
  );
  const [form] = Form.useForm();
  const [isUpdateDisabled, setIsUpdateDisabled] = useState(true);

  const [searchCriteria, setSearchCriteria] = useState(null);

  const { runAdHocSearch, isLoading } = useAdHocSearch(
    workspaceId,
    'workspace',
    searchCriteria,
    workspaceContext
  );

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  const emptyFormValues = {
    multiCriteria: [
      {
        name: '',
        headings: [],
        question: '',
        sourceQuestion: '',
        targetQuestion: '',
        headers: [],
        enableTableSearch: false,
        enableGrouping: false,
        pageStart: null,
        pageEnd: null,
      },
    ],
    entityNames: null,
    expectedAnswerType: 'auto',
    customFormValue: [],
    format: null,
  };
  const [formInitialValues] = useState(emptyFormValues);
  useEffect(() => {
    // nosonar
    const searchCriteria = workspaceContext.relationSearchCriteria;
    if (searchCriteria) {
      let formValues = {
        customFormValue: [],
        format: null,
        multiCriteria: [],
      };

      if (searchCriteria.criterias) {
        for (let criteria of searchCriteria.criterias) {
          formValues.multiCriteria.push({
            templates: criteria.templates,
            question: criteria.question,
            headers: criteria.headers,
            entityTypes: criteria.entityTypes,
            sourceQuestion:
              criteria.additionalQuestions.length > 0
                ? criteria.additionalQuestions[0]
                : '',
            targetQuestion:
              criteria.additionalQuestions.length > 1
                ? criteria.additionalQuestions[1]
                : '',
            enableGrouping: criteria.groupFlag === 'enable',
            enableTableSearch: criteria.tableFlag === 'enable',
            pageStart: criteria.pageStart == -1 ? null : criteria.pageStart,
            pageEnd: criteria.pageEnd == -1 ? null : criteria.pageEnd,
          });
        }
      }

      form.setFieldsValue(formValues);
    } else {
      form.setFieldsValue(emptyFormValues);
    }
  }, [workspaceContext.relationSearchCriteria]);

  const formItemLayout = {
    labelCol: { span: 24 },
    wrapperCol: { span: 24 },
    style: { marginBottom: '10px' },
  };

  const handleClear = () => {
    clearRelationSearchCriteria(workspaceContext);
  };

  const handlePageChange = async (page, pageSize) => {
    let criteria = workspaceContext.relationSearchCriteria;
    setCurrentPage(page);
    criteria.offset = (page - 1) * pageSize;
    criteria.docPerPage = pageSize;
    setLoading(true);
    setSearchCriteria(criteria);
    runAdHocSearch();
    setLoading(false);
  };

  const handleSearch = async () => {
    setLoading(true);
    const fieldsData = form.getFieldsValue();
    console.debug('fields are: ', fieldsData);
    const searchCriteria = createAdHocSearch(
      workspaceContext,
      fieldsData,
      null,
      null
    );

    searchCriteria.searchType = 'relation-' + relationType;
    searchCriteria.postProcessors = ['RelationExtractionProcessor()'];
    searchCriteria.groupByFile = false;
    console.debug('search criteria is: ', searchCriteria);
    workspaceContext.setRelationSearchCriteria(searchCriteria);
    setSearchCriteria(searchCriteria);
    runAdHocSearch();
    setLoading(false);
    setIsUpdateDisabled(false);
  };

  const fetchSearchResults = useCallback(
    async selectedRelation => {
      if (selectedRelation) {
        console.debug({ selectedRelation });
        setLoading(true);
        const searchCriteria = selectedRelation.searchCriteria;
        console.debug('search criteria is: ', searchCriteria);
        workspaceContext.setRelationSearchCriteria(searchCriteria);
        setSearchCriteria(searchCriteria);
        runAdHocSearch();
        setLoading(false);
      }
    },
    [workspaceId]
  );

  useEffect(() => {
    if (selectedRelation) {
      fetchSearchResults(selectedRelation);
    }
  }, [selectedRelation, fetchSearchResults]);

  const handleSave = async fieldName => {
    const fieldDefinition = {
      name: fieldName,
      workspaceId,
      isUserDefined: true,
      isEnteredField: false,
      dataType: workspaceContext.relationSearchCriteria.searchType,
      parentBundleId: null,
      searchCriteria: workspaceContext.relationSearchCriteria,
    };
    fieldDefinition.searchCriteria.docPerPage =
      searchCriteriaDefaults.RELATIONS_PER_PAGE;

    console.debug('will save..', fieldDefinition);
    try {
      let response = await API.post(`/field`, fieldDefinition, {
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
      });
      console.debug('response is', response);
    } catch (error) {
      showError(error);
    }

    onEdited();
  };

  const handleUpdate = async () => {
    try {
      let response = await API.post(
        `/field/modify/${selectedRelation.id}?action=replace`,
        {
          ...selectedRelation,
          searchCriteria: workspaceContext.relationSearchCriteria,
        },
        {
          headers: {
            'Content-Type': 'application/json; charset=UTF-8',
          },
        }
      );
      console.debug('response is', response);
    } catch (error) {
      showError(error);
    }

    onEdited();
  };

  const handleDelete = async id => {
    setLoading(true);
    try {
      let res = await API.post(`field/delete/${id}`, {
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      console.debug('deleted relation field:', id, res);
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
    onEdited();
  };

  const getRelationLabel = () => {
    return relationType == relationtypes.TRIPLE ? 'Triple' : 'Node';
  };

  return (
    <div style={{ height: 'calc(100vh - 172px)' }}>
      <Card size="small" style={{ marginBottom: 10 }}>
        <Row gutter={[10, 10]}>
          <Col span={6}>
            <Space layout="horizontal" align="baseline">
              <Title level={5}>
                {selectedRelation
                  ? selectedRelation.name
                  : `${getRelationLabel()}  Search Criteria`}
              </Title>
            </Space>
          </Col>
          <Col span={12}>
            {workspaceContext.relationSearchResults.pagination &&
              workspaceContext.relationSearchResults.pagination.length > 0 && (
                <Text>
                  Found matches in{' '}
                  {
                    workspaceContext.relationSearchResults.pagination[0]
                      .workspace.total
                  }{' '}
                  passage
                  {workspaceContext.relationSearchResults.pagination[0]
                    .workspace.total > 1
                    ? 's'
                    : ''}
                  . Showing page {currentPage}:
                </Text>
              )}
          </Col>
          <Col span={6}>
            <Row justify="end">
              <Col>
                {selectedRelation ? (
                  <Space direction="horizontal">
                    <Button
                      onClick={onVisualize}
                      icon={<EyeOutlined />}
                      type="default"
                    ></Button>
                    <Popconfirm
                      key="delete"
                      title="Are you sure？"
                      okText="Yes"
                      cancelText="No"
                      onConfirm={() => handleDelete(selectedRelation?.id)}
                    >
                      <Button type="default" icon={<DeleteOutlined />}></Button>
                    </Popconfirm>
                    <Button
                      disabled={isUpdateDisabled}
                      onClick={handleUpdate}
                      icon={<SaveOutlined />}
                      type="primary"
                    ></Button>
                    <Button icon={<CloseOutlined />} onClick={onClose}></Button>
                  </Space>
                ) : (
                  <Space direction="horizontal">
                    <Button
                      disabled={
                        workspaceContext.relationSearchResults.empty ||
                        workspaceContext.relationSearchResults.fileFacts
                          .length === 0
                      }
                      onClick={() => setSaveModalVisible(true)}
                      icon={<SaveOutlined />}
                      type="primary"
                    ></Button>
                    <Button icon={<CloseOutlined />} onClick={onClose}></Button>
                  </Space>
                )}
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>
      <Row gutter={[8, 8]}>
        <Col span={6}>
          <Form form={form} layout="vertical" initialValues={formInitialValues}>
            <Suspense fallback={<Spin />}>
              <RelationCriteriaForm
                formItemLayout={formItemLayout}
                relationType={relationType}
              ></RelationCriteriaForm>
            </Suspense>
          </Form>
          <Row gutter={8} style={{ margin: '15px' }} justify="end">
            <Col>
              <Button
                type="link"
                danger
                icon={<ClearOutlined />}
                onClick={handleClear}
              >
                Clear
              </Button>
            </Col>
            <Col>
              <Button
                // spinning={loading}
                icon={<SearchOutlined />}
                type="primary"
                onClick={handleSearch}
              >
                Search
              </Button>
            </Col>
          </Row>
        </Col>
        <Col span={18}>
          <Spin spinning={loading} size="large">
            <RelationExtractionView
              setLoading={setLoading}
              searchResults={workspaceContext.relationSearchResults}
            />
            {!workspaceContext.relationSearchResults.empty &&
              workspaceContext.relationSearchResults.fileFacts.length > 0 && (
                <Pagination
                  className={'nlm-pagination'}
                  size="small"
                  showTotal={(total, range) =>
                    `${range[0]}-${range[1]} of ${total} items`
                  }
                  defaultCurrent={1}
                  current={currentPage}
                  total={Math.ceil(
                    workspaceContext.relationSearchResults.pagination[0]
                      .workspace.total
                  )}
                  pageSize={pageSize}
                  onChange={handlePageChange}
                  onShowSizeChange={(current, size) => setPageSize(size)}
                />
              )}
          </Spin>
        </Col>
      </Row>
      {saveModalVisible && (
        <SaveRelationModal
          hideModal={() => {
            setSaveModalVisible(false);
          }}
          onSaveCallback={handleSave}
        />
      )}
    </div>
  );
}
