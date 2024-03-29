import {
  BulbOutlined,
  ClearOutlined,
  CloseOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { AutoComplete, Button, Col, Input, Popover, Row } from 'antd';
import { useContext, useEffect, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import FieldFiltersContext from '../../../contexts/fieldFilters/FieldFiltersContext';
import usePageHelper from '../../../pages/hooks/usePageHelper';
import useAdHocSearch from '../../../queries/useAdhocSearch';
import {
  getSearchHistory,
  subscribeToSearchCriteria,
} from '../../../utils/apiCalls';
import {
  clearWorkspaceSearchCriteria,
  clearWorkspaceSearchResults,
  isSearchApplied,
  questionTipsContent,
} from '../../../utils/helpers';
import AdvancedSearch from '../../AdvancedSearch';
import SearchSaver from '../../SearchSaver';
import { WorkspaceContext } from '../../WorkspaceContext';
import useFieldBundles from '../fields/useFieldBundles';

const { Search: InputSearch } = Input;
export default function Search({ resetPagination = () => {}, mode }) {
  const { workspaceId, documentId } = useParams();
  const history = useHistory();
  const searchComponent = useRef();
  const workspaceContext = useContext(WorkspaceContext);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState([]);
  const { isSearchPage, isSearchHomePage } = usePageHelper();
  const [advancedSearchVisible, setAdvancedSearchVisible] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  let level = documentId ? 'doc' : 'workspace';
  const { fieldFilters } = useContext(FieldFiltersContext);
  const { defaultFieldBundleId } = useFieldBundles(workspaceId);
  let fieldFilter;
  if (fieldFilters) {
    fieldFilter = {
      fieldBundleId: defaultFieldBundleId,
      filterModel: fieldFilters,
    };
  }
  const { runAdHocSearch, isLoading } = useAdHocSearch(
    documentId || workspaceId,
    level,
    searchCriteria,
    workspaceContext,
    fieldFilter
  );

  const isAdvancedSearchApplied = searchCriteria => {
    const criterion = searchCriteria?.criterias && searchCriteria?.criterias[0];
    const multipleCriteriaPresent =
      searchCriteria?.criterias && searchCriteria?.criterias.length > 1;
    return (
      multipleCriteriaPresent ||
      criterion?.templates?.length ||
      criterion?.headers?.length ||
      criterion?.entityTypes?.length ||
      criterion?.pageStart > -1 ||
      criterion?.pageEnd > -1 ||
      criterion?.beforeContextWindow > 0 ||
      criterion?.afterContextWindow > 0 ||
      criterion?.groupFlag !== 'disable' ||
      criterion?.tableFlag !== 'disable' ||
      searchCriteria?.expectedAnswerType ||
      searchCriteria?.customFormValue ||
      searchCriteria?.entityNames ||
      searchCriteria?.entityPhrase
    );
  };

  useEffect(() => {
    fieldFilters && runAdHocSearch();
  }, [fieldFilters, runAdHocSearch]);

  useEffect(() => {
    workspaceContext.setWorkspaceSearchLoading(isLoading);
    workspaceContext.setSearchLoading(isLoading);
  }, [isLoading]);

  useEffect(() => {
    if (
      workspaceContext.workspaceSearchCriteria &&
      workspaceContext.workspaceSearchCriteria.criterias
    ) {
      let criteriaQuestion =
        workspaceContext.workspaceSearchCriteria.criterias[0].question;
      setQuestion(criteriaQuestion);
      setSearchCriteria(workspaceContext.workspaceSearchCriteria);
      if (
        mode === 'EXTRACT' &&
        isAdvancedSearchApplied(workspaceContext.workspaceSearchCriteria)
      ) {
        setAdvancedSearchVisible(true);
      }
    } else {
      setQuestion('');
    }
  }, [workspaceContext.workspaceSearchCriteria]);

  useEffect(() => {
    async function fetchSearchHistory() {
      const options = await getSearchHistory(workspaceId);
      setOptions(options);
    }
    if (workspaceId) {
      fetchSearchHistory();
    }
  }, [workspaceId]);

  useEffect(() => {
    if (workspaceId && !isSearchPage && mode === 'SEARCH') {
      clearWorkspaceSearchCriteria(workspaceContext);
      setTimeout(() => {
        clearWorkspaceSearchResults(workspaceContext);
      });
    }
  }, [workspaceId, isSearchPage]);

  const onSearch = async (searchCriteria, question) => {
    // nosonar
    if (question && /\S/.test(question)) {
      if (!(searchCriteria.criterias && searchCriteria.criterias.length)) {
        searchCriteria.criterias = [
          {
            question: question.trim(),
            templates: [],
            headers: [],
            expectedAnswerType: 'auto',
            groupFlag: 'disable',
            tableFlag: 'disable',
            pageStart: -1,
            pageEnd: -1,
            beforeContextWindow: 0,
            afterContextWindow: 0,
            criteriaRank: -1,
            entityTypes: [],
          },
        ];
      } else {
        searchCriteria.criterias[0].question = question.trim();
      }
      setQuestion(searchCriteria.criterias[0].question);

      searchCriteria.postProcessors = searchCriteria.postProcessors
        ? searchCriteria.postProcessors
        : [];
      searchCriteria.aggregatePostProcessors =
        searchCriteria.aggregateProcessors
          ? searchCriteria.aggregateProcessors
          : [];
      searchCriteria.topn = isSearchPage ? 3 : 20;
      searchCriteria.matchPerDoc = isSearchPage ? 3 : 20;
      searchCriteria.docPerPage = workspaceContext.searchCriteriaDocPerPage;
      searchCriteria.offset = 0;
      searchCriteria.groupByFile = true;
      workspaceContext.setWorkspaceSearchMode(level === 'workspace');
      workspaceContext.setSearchResultsVisible(
        !workspaceContext.workspaceSearchMode
      );
      workspaceContext.setWorkspaceSearchCriteria(searchCriteria);
      setSearchCriteria(searchCriteria);
      if (!isSearchHomePage) {
        resetPagination();
        runAdHocSearch();
      }
      if (isSearchPage) {
        history.push({
          pathname: `/search/${workspaceId}/results`,
          state: { from: 'search-home' },
        });
      }
    }
  };
  const clearAdvanceSearch = () => {
    clearWorkspaceSearchCriteria(workspaceContext);
    clearWorkspaceSearchResults(workspaceContext);
  };
  return (
    <>
      {workspaceContext.saveFieldVisible && (
        <SearchSaver
          question={question}
          saveFieldVisible={workspaceContext.saveFieldVisible}
          setSaveFieldVisible={workspaceContext.setSaveFieldVisible}
          workspaceId={workspaceId}
        ></SearchSaver>
      )}
      <Row justify="center" className="nlm-search__search">
        <Col flex="auto">
          <Row gutter={[10, 10]} align="middle">
            {(mode !== 'EXTRACT' || !advancedSearchVisible) && (
              <>
                <Col flex="auto">
                  <AutoComplete
                    disabled={
                      advancedSearchVisible ||
                      isAdvancedSearchApplied(searchCriteria)
                    }
                    style={{ width: '100%' }}
                    options={options}
                    onSelect={selectedQuestion => {
                      setQuestion(selectedQuestion);
                      onSearch({}, selectedQuestion);
                    }}
                    filterOption={true}
                    value={
                      !isAdvancedSearchApplied(searchCriteria) &&
                      (question
                        ? question
                        : workspaceContext.workspaceSearchCriteria.question)
                    }
                    backfill
                  >
                    <InputSearch
                      ref={searchComponent}
                      className="header-bar--search"
                      placeholder={
                        workspaceContext.workspaceSearchMode
                          ? 'Ask a question or enter keywords'
                          : 'Search in selected file'
                      }
                      size="large"
                      enterButton="Search"
                      allowClear
                      autoFocus
                      onChange={event => {
                        setQuestion(event.target.value);
                        if (event.target.value === '') {
                          clearWorkspaceSearchCriteria(workspaceContext);
                          clearWorkspaceSearchResults(workspaceContext);
                        }
                      }}
                      onSearch={question => {
                        onSearch({}, question);
                        setQuestion(question);
                      }}
                    />
                  </AutoComplete>
                </Col>
                {(isSearchApplied(searchCriteria) || fieldFilter) && (
                  <Col>
                    <Button
                      size="large"
                      onClick={async () => {
                        setIsSubscribing(true);
                        if (fieldFilter) {
                          searchCriteria.fieldFilter = fieldFilter;
                        }
                        await subscribeToSearchCriteria({
                          workspaceId,
                          searchCriteria,
                        });
                        setIsSubscribing(false);
                      }}
                      loading={isSubscribing}
                    >
                      Subscribe
                    </Button>
                  </Col>
                )}
                <Col
                  flex={
                    isAdvancedSearchApplied(searchCriteria) ? '280px' : '150px'
                  }
                  style={{ textAlign: 'center' }}
                >
                  {isAdvancedSearchApplied(searchCriteria) ? (
                    <>
                      <Button
                        size="large"
                        type="primary"
                        icon={
                          advancedSearchVisible ? (
                            <CloseOutlined />
                          ) : (
                            <SettingOutlined />
                          )
                        }
                        onClick={() => {
                          setAdvancedSearchVisible(!advancedSearchVisible);
                        }}
                      >
                        Advance Search is applied
                      </Button>
                      <Button
                        size="small"
                        type="link"
                        danger
                        icon={<ClearOutlined />}
                        onClick={clearAdvanceSearch}
                      >
                        Clear
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="large"
                      icon={
                        advancedSearchVisible ? (
                          <CloseOutlined />
                        ) : (
                          <SettingOutlined />
                        )
                      }
                      onClick={() => {
                        setAdvancedSearchVisible(!advancedSearchVisible);
                      }}
                    >
                      Advance Search
                    </Button>
                  )}
                </Col>
                <Col flex="40px">
                  {workspaceContext.currentWorkspace?.settings?.domain !==
                    'biology' && (
                    <Popover
                      content={questionTipsContent}
                      title="Question Tips"
                    >
                      <Button
                        size="large"
                        type="link"
                        color="green"
                        icon={<BulbOutlined></BulbOutlined>}
                      ></Button>
                    </Popover>
                  )}
                </Col>
              </>
            )}
          </Row>
        </Col>
      </Row>
      <Row>
        <Col
          span={24}
          style={{
            display: advancedSearchVisible ? 'block' : 'none',
            ...(mode === 'EXTRACT'
              ? {}
              : { position: 'absolute', top: 50, zIndex: 3 }),
          }}
        >
          {
            <AdvancedSearch
              setAdvancedSearchVisible={setAdvancedSearchVisible}
              onClear={clearAdvanceSearch}
              searchCriteria={workspaceContext.workspaceSearchCriteria}
              onSearch={searchCriteria =>
                workspaceContext.setWorkspaceSearchCriteria(searchCriteria)
              }
              question={question}
              setQuestion={setQuestion}
              formLayout={mode === 'EXTRACT' && 'vertical'}
              mode={mode}
            ></AdvancedSearch>
          }
        </Col>
      </Row>
    </>
  );
}
