import {
  CloseCircleOutlined,
  SendOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { AutoComplete, Col, Row, Input, Button, Tooltip } from 'antd';
import { useContext, useEffect, useRef, useState } from 'react';
import useAdHocSearch from '../../../../queries/useAdhocSearch';
import { getSearchHistory } from '../../../../utils/apiCalls';
import { clearDocSearchCriteria } from '../../../../utils/helpers';
import AdvancedSearch from '../../../AdvancedSearch';
import { WorkspaceContext } from '../../../WorkspaceContext';
const { TextArea } = Input;
export default function DocSearchBox({
  docId,
  workspaceId,
  setSearchLoading,
  setAdvancedSearchVisible,
  advancedSearchVisible,
  isQnA,
}) {
  const searchComponent = useRef();
  const [options, setOptions] = useState([]);
  const [question, setQuestion] = useState('');
  const [currentCriterionIndex] = useState(0);
  let level = 'doc';
  let id = docId;
  const workspaceContext = useContext(WorkspaceContext);
  const [searchCriteria, setSearchCriteria] = useState(null);

  const { runAdHocSearch, isLoading } = useAdHocSearch(
    id,
    level,
    searchCriteria,
    workspaceContext
  );

  useEffect(() => {
    setSearchLoading(isLoading);
  }, [isLoading]);

  useEffect(() => {
    setQuestion(workspaceContext.docSearchCriteria.criterias[0].question);
  }, [workspaceContext.docSearchCriteria]);

  useEffect(() => {
    async function fetchSearchHistory() {
      const options = await getSearchHistory(workspaceId);
      setOptions(options);
    }
    workspaceId && fetchSearchHistory();
  }, [workspaceId]);

  const onSearch = async searchCriteria => {
    // nosonar
    if (searchCriteria.question && /\S/.test(searchCriteria.question)) {
      if (!(searchCriteria.criterias && searchCriteria.criterias.length)) {
        searchCriteria.criterias = [
          {
            question: searchCriteria.question.trim(),
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
          },
        ];
      } else {
        searchCriteria.criterias[0].question = searchCriteria.question.trim();
      }
      searchCriteria.question = searchCriteria.question.trim();
      setQuestion(searchCriteria.criterias[0].question);

      searchCriteria.postProcessors = searchCriteria.postProcessors
        ? searchCriteria.postProcessors
        : [];
      searchCriteria.aggregatePostProcessors =
        searchCriteria.aggregateProcessors
          ? searchCriteria.aggregateProcessors
          : [];
      searchCriteria.topn = 100;
      searchCriteria.docPerPage = 100;
      searchCriteria.matchPerDoc = 100;
      searchCriteria.offset = 0;
      searchCriteria.groupByFile = true;
      if (isQnA) {
        searchCriteria.disableExtraction = true;
        searchCriteria.abstractiveProcessors = [
          'AbstractiveSummaryProcessor()',
        ];
      }
      workspaceContext.setDocSearchCriteria(searchCriteria);
      setSearchCriteria(searchCriteria);
      runAdHocSearch();
    }
  };

  return (
    <>
      {!advancedSearchVisible && (
        <Row>
          <Col flex="auto">
            <AutoComplete
              disabled={advancedSearchVisible}
              style={{ width: '100%' }}
              options={options}
              onSelect={selectedQuestion => {
                onSearch({
                  question: selectedQuestion,
                });
                setQuestion(selectedQuestion);
              }}
              filterOption={true}
              value={
                question
                  ? question
                  : workspaceContext.docSearchCriteria.question
              }
              backfill
            >
              <div style={{ position: 'relative' }}>
                <TextArea
                  style={{ resize: 'none' }}
                  rows={4}
                  value={
                    question
                      ? question
                      : workspaceContext.docSearchCriteria.question
                  }
                  ref={searchComponent}
                  placeholder={isQnA ? 'Ask a question' : 'Search'}
                  autoFocus
                  onPressEnter={event => {
                    const searchQuestion = event.target.value;
                    onSearch({
                      question: searchQuestion,
                    });
                    setQuestion(searchQuestion);
                  }}
                  onChange={event => {
                    setQuestion(event.target.value);
                    if (event.target.value === '') {
                      clearDocSearchCriteria(workspaceContext);
                    }
                  }}
                  onKeyDown={event => {
                    if (event.keyCode === 13 || event.key === 'Enter') {
                      event.preventDefault();
                    }
                  }}
                />

                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 5,
                    zIndex: 1,
                  }}
                >
                  <Tooltip title="Advance Search">
                    <Button
                      type="link"
                      icon={
                        <SettingOutlined
                          onClick={() => {
                            setAdvancedSearchVisible(!advancedSearchVisible);
                          }}
                        />
                      }
                    />
                  </Tooltip>
                  <Button
                    type="link"
                    icon={<SendOutlined />}
                    onClick={() => {
                      onSearch({
                        question,
                      });
                    }}
                  />
                </div>
                <div style={{ position: 'absolute', top: 0, right: 5 }}>
                  {question && (
                    <CloseCircleOutlined
                      onClick={() => {
                        setQuestion('');
                        clearDocSearchCriteria(workspaceContext);
                        workspaceContext.setDocSearchResults({
                          empty: false,
                          results: [],
                        });
                      }}
                    />
                  )}
                </div>
              </div>
            </AutoComplete>
          </Col>
        </Row>
      )}
      <Row style={{ display: advancedSearchVisible ? 'block' : 'none' }}>
        <Col span={24} style={{ marginTop: 5 }}>
          <AdvancedSearch
            setAdvancedSearchVisible={setAdvancedSearchVisible}
            question={question}
            searchCriteria={workspaceContext.docSearchCriteria}
            onClear={() => clearDocSearchCriteria(workspaceContext)}
            onSearch={searchCriteria =>
              workspaceContext.setDocSearchCriteria(searchCriteria)
            }
            documentId={docId}
            setSearchLoading={setSearchLoading}
            setQuestion={setQuestion}
            currentCriterionIndex={currentCriterionIndex}
            formLayout="vertical"
          ></AdvancedSearch>
        </Col>
      </Row>
    </>
  );
}
