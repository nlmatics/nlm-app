import {
  ClearOutlined,
  CloseOutlined,
  ExclamationCircleTwoTone,
  QuestionCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Collapse,
  Form,
  Grid,
  Input,
  message,
  Popover,
  Row,
  Select,
  Spin,
  Typography,
} from 'antd';
import {
  forwardRef,
  lazy,
  Suspense,
  useContext,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { useHistory, useParams } from 'react-router-dom';
import AppContext from '../contexts/app/AppContext';
import DocumentContext from '../contexts/document/DocumentContext';
import FieldFiltersContext from '../contexts/fieldFilters/FieldFiltersContext';
import usePageHelper from '../pages/hooks/usePageHelper';
import useAdHocSearch from '../queries/useAdhocSearch';
import { answerTypeOptions } from '../utils/constants';
import { createAdHocSearch, getAnswerPickerValues } from '../utils/helpers';
import { searchTips } from './Tips';
import useFieldBundles from './workspace/fields/useFieldBundles';
import { WorkspaceContext } from './WorkspaceContext';
const SearchCriteriaForm = lazy(() => import('./SearchCriteriaForm.js'));
const AdvancedSearch = forwardRef(function AdvancedSearch(
  {
    question,
    setAdvancedSearchVisible,
    searchCriteria,
    onClear,
    onSearch,
    documentId,
    setSearchLoading,
    currentCriterionIndex,
    formLayout = 'horizontal',
    mode,
  },
  ref
) {
  const flex = formLayout === 'vertical' ? '25px' : '120px';
  const { useBreakpoint } = Grid;
  const breakpoints = useBreakpoint();
  const layoutProps = {
    labelCol: { flex },
    wrapperCol: { flex: 'auto' },
    style: { marginBottom: 10 },
  };
  const { workspaceId } = useParams();
  const history = useHistory();
  // Always need a state variable defined, even if it's not used
  const workspaceContext = useContext(WorkspaceContext);
  const [form] = Form.useForm();
  // eslint-disable-next-line
  const [loading, setLoading] = useState(false); // nosonar
  const [selectedFormatter, setFormatter] = useState('');
  // eslint-disable-next-line
  const [formatterValue, setFormatterValue] = useState('default'); // nosonar
  const [customFormatterOptions, setCustomFormatterOptions] = useState([]);
  const [isFormatAnswerSetterOpen, setIsFormatAnswerSetterOpen] =
    useState(false);
  const [customFormValueString, setCustomFormValueString] = useState('');
  const { isSearchPage, isDocumentPage } = usePageHelper();
  const { isDrawerOpen } = useContext(DocumentContext);
  const isDocumentDisplayed = isDocumentPage || isDrawerOpen;
  const [querySearchCriteria, setQuerySearchCriteria] = useState({
    ...searchCriteria,
    criterias: searchCriteria?.criterias?.map(criteria => {
      return {
        ...criteria,
        entityTypes: criteria?.entityTypes?.flatMap(entityType =>
          entityType.split(',')
        ),
      };
    }),
  });
  const { isChattyPdf, isEDGAR } = useContext(AppContext);
  const { fieldFilters } = useContext(FieldFiltersContext);
  const { defaultFieldBundleId } = useFieldBundles(workspaceId);
  let fieldFilter;
  if (fieldFilters) {
    fieldFilter = {
      fieldBundleId: defaultFieldBundleId,
      filterModel: fieldFilters,
    };
  }

  useEffect(() => {
    setQuerySearchCriteria({
      ...searchCriteria,
      criterias: searchCriteria?.criterias?.map(criteria => {
        return {
          ...criteria,
          entityTypes: criteria?.entityTypes?.flatMap(entityType =>
            entityType.split(',')
          ),
        };
      }),
    });
  }, [searchCriteria, question]);

  const formInitialValues = {
    multiCriteria: [
      {
        name: '',
        headings: [],
        question: question,
        headers: [],
        entityTypes: [],
        enableTableSearch: false,
        enableGrouping: false,
        pageStart: null,
        pageEnd: null,
        beforeContextWindow: 0,
        afterContextWindow: 0,
      },
    ],
    expectedAnswerType: 'auto',
    customFormValue: [],
    format: null,
  };
  const level = documentId ? 'doc' : 'workspace';

  const { runAdHocSearch, isLoading } = useAdHocSearch(
    documentId || workspaceId,
    level,
    querySearchCriteria,
    workspaceContext,
    fieldFilter
  );

  useEffect(() => {
    if (documentId) {
      setSearchLoading(isLoading);
    } else {
      workspaceContext.setWorkspaceSearchLoading(isLoading);
    }
  }, [isLoading]);

  useEffect(() => {
    if (workspaceContext.workspaceSearchHistoryTriggered) {
      form.setFieldsValue({
        templates: workspaceContext.workspaceSearchHistoryParams.pattern,
      });
      form.setFieldsValue({
        headers: workspaceContext.workspaceSearchHistoryParams.header,
      });
      let formatterKey = workspaceContext.workspaceSearchHistoryParams.format;
      setFormatter(formatterKey);
      setFormatterValue(getFormatterKey(formatterKey));

      workspaceContext.setWorkspaceSearchHistoryTriggered(false);
    }
  }, [workspaceContext.workspaceSearchHistoryTriggered]);

  // TODO: Reduce functional complexity
  useEffect(() => {
    // nosonar
    if (querySearchCriteria) {
      let formValues = {
        customFormValue: [],
        format: null,
        multiCriteria: [],
        expectedAnswerType: 'auto',
      };

      if (querySearchCriteria.postProcessors) {
        for (let postProcessor of querySearchCriteria.postProcessors) {
          if (postProcessor.startsWith('AnswerPicker')) {
            formValues.customFormValue = getAnswerPickerValues(postProcessor);
          }
          if (postProcessor.startsWith('EntityExtractionProcessor')) {
            let str = postProcessor.replaceAll('"', '');
            let patt = /\[(.*)\]/i;
            let result = str.match(patt);
            let currentQuestion = str.split('question=')[1];
            currentQuestion = currentQuestion.substring(
              0,
              currentQuestion.length - 1
            );
            formValues.entityNames = result[1].split(',');
            formValues.entityPhrase = currentQuestion;
          }
        }
      }

      if (querySearchCriteria.criterias) {
        for (let criteria of querySearchCriteria.criterias) {
          formValues.multiCriteria.push({
            templates: criteria.templates,
            question: criteria.question,
            headers: criteria.headers,
            entityTypes: criteria.entityTypes,
            enableGrouping: criteria.groupFlag === 'enable',
            enableTableSearch: criteria.tableFlag === 'enable',
            pageStart: criteria.pageStart == -1 ? null : criteria.pageStart,
            pageEnd: criteria.pageEnd == -1 ? null : criteria.pageEnd,
            beforeContextWindow: criteria.beforeContextWindow,
            afterContextWindow: criteria.afterContextWindow,
          });
        }
      }

      form.setFieldsValue(formValues);
    } else {
      form.setFieldsValue(formInitialValues);
    }
  }, [querySearchCriteria]);

  useImperativeHandle(ref, () => ({
    searchFromBar() {
      handleSearch();
    },
  }));

  const handleSearch = async () => {
    if (mode !== 'EXTRACT') {
      setAdvancedSearchVisible(false);
    }
    setLoading(true);
    try {
      const fieldsData = form.getFieldsValue();
      fieldsData.format = selectedFormatter;
      const searchCriteria = createAdHocSearch(
        workspaceContext,
        fieldsData,
        customFormatterOptions,
        undefined
      );
      searchCriteria.groupByFile = true;
      searchCriteria.topn = isSearchPage ? 3 : 20;
      searchCriteria.matchPerDoc = isSearchPage ? 3 : 20;
      workspaceContext.setWorkspaceSearchMode(level === 'workspace');
      workspaceContext.setSearchResultsVisible(
        !workspaceContext.workspaceSearchMode
      );
      setQuerySearchCriteria({
        ...searchCriteria,
        criterias: searchCriteria?.criterias?.map(criteria => {
          return {
            ...criteria,
            entityTypes: criteria?.entityTypes?.flatMap(entityType =>
              entityType.split(',')
            ),
          };
        }),
      });
      onSearch({
        ...searchCriteria,
        criterias: searchCriteria?.criterias?.map(criteria => {
          return {
            ...criteria,
            entityTypes: criteria?.entityTypes?.flatMap(entityType =>
              entityType.split(',')
            ),
          };
        }),
      });

      runAdHocSearch();

      if (isSearchPage && !isDocumentDisplayed) {
        history.push(`/search/${workspaceId}/results`);
      }
    } catch (err) {
      console.trace(err);
      const errMessage =
        err.message === 'Exception: <Response [500]>'
          ? "500 Error: We're sorry. Something went wrong. Please try again later."
          : err.message;
      message.error({
        icon: (
          <ExclamationCircleTwoTone twoToneColor="var(--error-color-red)" />
        ),
        content: (
          <span>
            {`error: ${errMessage}`}
            <CloseOutlined
              className="advanced-search--close-outlined"
              onClick={() => message.destroy()}
            />
          </span>
        ),
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormatter('');
    setFormatterValue('default');
    setCustomFormatterOptions([]);
    if (onClear) {
      onClear();
    }
  };

  const getFormatterKey = format => {
    if (format === 'NumberFormatterProcessor("MONEY")') {
      return 'currency';
    } else if (format === 'NumberFormatterProcessor("UNITS")') {
      return 'unit';
    } else if (format === 'edit') {
      return 'Custom Values';
    } else if (format == 'CurrencyExtractorProcessor()') {
      return 'currency_extractor';
    } else {
      return 'default';
    }
  };

  return (
    <>
      <Card
        bodyStyle={{
          padding: 10,
          overflow: 'auto',
          height:
            formLayout === 'vertical'
              ? `calc(100vh - ${
                  isChattyPdf()
                    ? breakpoints.xs
                      ? 420
                      : 360
                    : mode === 'EXTRACT'
                    ? 235
                    : 160
                }px)`
              : 'auto',
          maxHeight: 680,
        }}
      >
        <Row>
          <Col span={24}>
            <Form
              form={form}
              layout={formLayout}
              labelCol={{ flex: '200px' }}
              wrapperCol={{ flex: 'auto' }}
              initialValues={formInitialValues}
            >
              <Suspense fallback={<Spin />}>
                <SearchCriteriaForm
                  currentCriterionIndex={currentCriterionIndex}
                  layout={formLayout}
                ></SearchCriteriaForm>
              </Suspense>
              {!isChattyPdf() && (
                <Collapse ghost>
                  <Collapse.Panel
                    header="More settings"
                    key="1"
                    forceRender={true}
                  >
                    <Row gutter={[10, 10]}>
                      <Col span={12}>
                        <Form.Item
                          {...layoutProps}
                          label={
                            <>
                              <span className="input-description">
                                Answer type
                              </span>
                              <Popover
                                content={searchTips.answerType.help}
                                title="Answer type"
                                trigger="click"
                              >
                                <QuestionCircleOutlined />
                              </Popover>
                            </>
                          } // Custom Values
                          name="expectedAnswerType"
                        >
                          <Select>
                            {Object.entries(answerTypeOptions).map(
                              ([key, value]) => {
                                return (
                                  <Select.Option key={key} value={key}>
                                    {value}
                                  </Select.Option>
                                );
                              }
                            )}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Row gutter={[10, 10]}>
                          <Col flex="auto">
                            <Form.Item
                              {...layoutProps}
                              label={
                                <>
                                  <span className="input-description">
                                    Format Answer
                                  </span>
                                  <Popover
                                    content={searchTips.formatAnswer.help}
                                    title="Format Answer"
                                    trigger="click"
                                  >
                                    <QuestionCircleOutlined />
                                  </Popover>
                                </>
                              } // Custom Values
                              name="customFormValue"
                            >
                              <Select
                                mode="tags"
                                dropdownStyle={{ display: 'none' }}
                                placeholder={
                                  searchTips.formatAnswer.placeHolderText
                                }
                                allowClear
                                onChange={() => {
                                  setCustomFormatterOptions(
                                    form.getFieldsValue().customFormValue
                                  );
                                }}
                              />
                            </Form.Item>
                          </Col>
                          {!isEDGAR() && (
                            <Col flex="70px">
                              <Form.Item name="placeholderField">
                                <Popover
                                  open={isFormatAnswerSetterOpen}
                                  content={
                                    <Row
                                      gutter={[10, 10]}
                                      style={{ width: 300 }}
                                    >
                                      <Col span={24}>
                                        <Typography.Text>
                                          Input the values in a column format.
                                        </Typography.Text>
                                      </Col>
                                      <Col span={24}>
                                        <Input.TextArea
                                          rows={10}
                                          placeholder="Enter list"
                                          onChange={event =>
                                            setCustomFormValueString(
                                              event.target.value
                                            )
                                          }
                                        />
                                      </Col>
                                      <Col span={24}>
                                        <Button
                                          type="primary"
                                          style={{ marginRight: 10 }}
                                          onClick={() => {
                                            if (
                                              customFormValueString &&
                                              !!customFormValueString.trim()
                                            ) {
                                              const fieldValue =
                                                customFormValueString?.split(
                                                  '\n'
                                                );
                                              setCustomFormatterOptions(
                                                fieldValue
                                              );
                                              form.setFieldValue(
                                                'customFormValue',
                                                fieldValue
                                              );
                                            }
                                            setIsFormatAnswerSetterOpen(false);
                                          }}
                                        >
                                          Set Format Answers
                                        </Button>
                                        <Button
                                          onClick={() =>
                                            setIsFormatAnswerSetterOpen(false)
                                          }
                                        >
                                          Close
                                        </Button>
                                      </Col>
                                    </Row>
                                  }
                                  title="Set Bulk Format Answers"
                                  trigger="click"
                                  onOpenChange={isOpen =>
                                    setIsFormatAnswerSetterOpen(isOpen)
                                  }
                                >
                                  <Button>Set Bulk</Button>
                                </Popover>
                              </Form.Item>
                            </Col>
                          )}
                        </Row>
                      </Col>
                    </Row>
                    <Row gutter={[10, 10]}>
                      <Col span={12}>
                        <Form.Item
                          {...layoutProps}
                          label={
                            <>
                              <span className="input-description">
                                Extract Names
                              </span>
                              <Popover
                                content={searchTips.extractNames.help}
                                title="Extract Names"
                                trigger="click"
                              >
                                <QuestionCircleOutlined />
                              </Popover>
                            </>
                          } // Custom Values
                          name="entityNames"
                        >
                          <Select
                            mode="tags"
                            dropdownStyle={{ display: 'none' }}
                            placeholder={
                              searchTips.extractNames.placeHolderText
                            }
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...layoutProps}
                          label={
                            <>
                              <span className="input-description">Role</span>
                              <Popover
                                content={searchTips.extractNames.help}
                                title="Extract Role"
                                trigger="click"
                              >
                                <QuestionCircleOutlined />
                              </Popover>
                            </>
                          } // Custom Values
                          name="entityPhrase"
                        >
                          <Input
                            placeholder={searchTips.extractRole.placeHolderText}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Collapse.Panel>
                </Collapse>
              )}
            </Form>
          </Col>
        </Row>
      </Card>
      <Card bodyStyle={{ padding: 10 }}>
        <Row gutter={[10, 10]} justify="end">
          <Col>
            <Button
              size="small"
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
              size="small"
              icon={<CloseOutlined />}
              onClick={() => setAdvancedSearchVisible(false)}
            >
              Close
            </Button>
          </Col>
          <Col>
            <Button
              size="small"
              icon={<SearchOutlined />}
              type="primary"
              onClick={handleSearch}
              loading={workspaceContext.workspaceSearchLoading}
            >
              Search
            </Button>
          </Col>
        </Row>
      </Card>
    </>
  );
});

export default AdvancedSearch;
