import {
  CheckCircleOutlined,
  ControlOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { makeStyles } from '@material-ui/styles';
import { Button, Col, List, Modal, Row, Spin, Tooltip, Typography } from 'antd';
import { lazy, Suspense, useContext, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import DocumentContext from '../contexts/document/DocumentContext';
import useUserInfo from '../hooks/useUserInfo';
import useUserPermission from '../hooks/useUserPermission';
import usePageHelper from '../pages/hooks/usePageHelper';
import {
  getCriteriaMessage,
  isValidCriteria,
  showResultInDocument,
} from '../utils/helpers';
import SearchCriteriaViewer from './SearchCriteriaViewer.js';
import SearchResultGrid from './SearchResultGrid';
import { WorkspaceContext } from './WorkspaceContext';
const SearchResultItem = lazy(() => import('./SearchResultItem'));

const useStyles = makeStyles({
  detailAnswerQuestion: {
    fontSize: '14px',
    marginBottom: 0,
    paddingBottom: '5px',
  },
  detailViewStyle: {},
  badgeBig: {
    display: 'inline-block',
    borderRadius: '50%',
    height: '28px',
    width: '28px',
    fontSize: '15px',
    textAlign: 'center',
    padding: '2px 4px 0px 4px',
  },
  detailDescriptionTitle: {
    fontSize: '15px',
  },
  questionCard: {
    height: '12vh',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '35px',
    paddingRight: '10px',
    boxShadow: '0px 3px 6px #00000029',
    zIndex: 9,
    position: 'relative',
  },
  secondLevelTitle: {
    fontSize: '14px',
  },
  secondLevelNoAnswerTitle: {
    fontSize: '14px',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  secondLevelList: {
    marginLeft: '0px',
    width: '100%',
  },
  searchResultsList: {
    overflowY: 'hidden',
    '&:hover': {
      overflowY: 'overlay',
    },
  },
  answerHeader: {
    marginTop: '1px',
    textTransform: 'uppercase',
    textAlign: 'left',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontSize: '12px',
  },
  groupTypeDescription: {
    opacity: 1,
    // fontStyle: 'italic',
  },
});

export default function SearchResult({
  fieldName,
  detailVisible,
  resultHandler,
  searchResults,
  tableHeight,
  saveNewAnswer,
  removeAnswer,
  pickResult,
  answerTypes,
  selectedSearchCriteria,
  showCreateFieldButton = false,
  showCriteriaActions = true,
  showCriteria = false,
  showQuestionTip = true,
  undoPick,
  docId,
  fileName,
  fileMeta,
  detailEditMode = false,
  empty = false,
  searchLoading = undefined,
  disableSpinner = false,
  showOnlyTopAnswer,
  setShowOnlyTopAnswer,
  from,
  fieldBundleId,
  workspaceId,
}) {
  const classes = useStyles();
  const history = useHistory();
  const { closeDocument } = useContext(DocumentContext);

  const workspaceContext = useContext(WorkspaceContext);
  const [selectedRowKey, setSelectedRowKey] = useState(null);
  const [prevResult, setPrevResult] = useState(null);
  const [debugModalVisible, setDebugModalVisible] = useState(false);
  const [criteriaViewerVisible, setCriteriaViewerVisible] = useState(false);
  const resultListRef = useRef();
  const { isSearchPage, isWorkspaceSearchPage } = usePageHelper();
  const { data: userInfo } = useUserInfo();
  const { isAllowedToCreateField } = useUserPermission();

  const showResult = result => {
    if (resultHandler) {
      resultHandler(result);
    } else {
      showResultInDocument(
        workspaceContext,
        prevResult,
        result,
        'match_idx',
        'phrase'
      );
    }
    setPrevResult(result);
  };

  useEffect(() => {
    if (resultListRef.current) {
      let resultList = resultListRef.current.getElementsByClassName(
        'search-results-list'
      )[0];
      if (resultList) {
        resultList.scrollTo(0, 0);
      }
    }
  }, [searchResults]);

  useEffect(() => {
    let searchResult = workspaceContext.workspaceSearchSelectedResult;
    if (searchResult && !resultHandler) {
      setSelectedRowKey(searchResult.match_idx);
      showResult(searchResult);
      if (resultListRef.current) {
        let selectedItem =
          resultListRef.current.getElementsByClassName('list-row-selected')[0];
        if (selectedItem) {
          selectedItem.scrollIntoView();
        }
      }
    }
  }, [workspaceContext.workspaceSearchSelectedResult]);

  const getSearchCriteriaActions = searchCriteria => {
    if (isValidCriteria(searchCriteria)) {
      return (
        <Row
          align="middle"
          style={{ padding: '10px 0' }}
          justify="space-between"
        >
          {userInfo && userInfo?.isAdmin && (
            <Col span={6} style={{ textAlign: 'left' }}>
              <Button
                size="small"
                type="text"
                onClick={() => {
                  setDebugModalVisible(true);
                }}
                style={{ width: '100%' }}
              >
                Explain
              </Button>
            </Col>
          )}
          <Col span={8}>
            <Button
              size="small"
              type="text"
              icon={<ControlOutlined />}
              onClick={() => setCriteriaViewerVisible(true)}
            >
              View Criteria
            </Button>
          </Col>
          <Col span={10} style={{ textAlign: 'right' }}>
            {showCreateFieldButton && isAllowedToCreateField() && (
              <Tooltip title="Create a field with this criteria">
                <Button
                  size="small"
                  shape="circle"
                  type="link"
                  icon={<PlusOutlined></PlusOutlined>}
                  onClick={() => {
                    // Ideally should be set inside FieldExtraction component but
                    // setting it here so that SearchCriteria carousel picks correct value.
                    workspaceContext.setWorkspaceSearchCriteria(
                      selectedSearchCriteria
                    );
                    closeDocument();
                    history.push({
                      pathname: `/workspace/${workspaceId}/extractions/dataFields/new`,
                      state: {
                        from: `/workspace/${workspaceId}/extractions/dataFields/all`,
                        workspaceSearchCriteria: selectedSearchCriteria,
                      },
                    });
                  }}
                >
                  Create field
                </Button>
              </Tooltip>
            )}
          </Col>
        </Row>
      );

      // }
    } else {
      return undefined;
    }
  };

  const getEmptyTextMessage = () => {
    let message = (
      <div style={{ textAlign: 'left' }}>
        <Typography.Title level={5}>
          <Typography.Link href="https://www.nlmatics.com/" target="_blank">
            nlmatics
          </Typography.Link>{' '}
          intelligent search:
        </Typography.Title>
        <List
          itemLayout="horizontal"
          dataSource={[
            {
              title: 'uses artificial intelligence',
              description: `to understand the meaning and intent behind the user's search query.`,
            },
            {
              title: 'uses the context',
              description: `of a user's search query to provide more relevant results.`,
            },
            {
              title: 'can understand',
              description: `synonyms, related concepts, and other contextual information to provide a wide range of relevant results.`,
            },
          ]}
          renderItem={({ title, description }) => (
            <List.Item>
              <List.Item.Meta
                avatar={<CheckCircleOutlined />}
                title={title}
                description={description}
              />
            </List.Item>
          )}
        />
      </div>
    );
    if (empty) {
      message = 'No results found. Please refine your query';
    }
    if (detailVisible) {
      message =
        'The field extraction criteria did not return any search results.';
    }
    return message;
  };

  return (
    <div className={classes.detailViewStyle}>
      <Spin
        size="large"
        tip="Looking for Answers..."
        spinning={
          (searchLoading || workspaceContext.searchLoading) && !disableSpinner
        }
      >
        {showCriteriaActions &&
          getSearchCriteriaActions(selectedSearchCriteria)}
        {showCriteria && showQuestionTip && !detailVisible && (
          <div>
            {getCriteriaMessage(selectedSearchCriteria, answerTypes, true)}
          </div>
        )}
        {/* {detailVisible && answerTypes.length > 0 &&
          <div>{getCriteriaMessage(selectedSearchCriteria, answerTypes, false)}</div>
        } */}
        <Modal
          title={'Complete Criteria'}
          open={criteriaViewerVisible}
          footer={null}
          onCancel={() => setCriteriaViewerVisible(false)}
          destroyOnClose
        >
          <SearchCriteriaViewer
            fieldDefinition={
              selectedSearchCriteria ? selectedSearchCriteria : {}
            }
          ></SearchCriteriaViewer>
        </Modal>
        <SearchResultGrid
          onClose={() => {
            setDebugModalVisible(false);
          }}
          topicFacts={searchResults}
          visible={debugModalVisible}
        />
        <div ref={resultListRef}>
          <List
            itemLayout="horizontal"
            locale={{ emptyText: getEmptyTextMessage() }}
            style={{
              height: `${tableHeight}`,
              overflowX: 'hidden',
              overflowY: 'auto',
              paddingRight: 5,
            }}
            className={`${classes.searchResultsList} search-results-list ${
              isSearchPage || isWorkspaceSearchPage ? 'nlm-indent-children' : ''
            }`}
            dataSource={searchResults}
            rowKey={searchResult => {
              return searchResult.unique_id;
            }}
            renderItem={searchResult => (
              <Suspense fallback={<Spin />}>
                <SearchResultItem
                  searchResult={{ ...searchResult, fieldName }}
                  detailVisible={detailVisible}
                  removeAnswer={removeAnswer}
                  pickResult={pickResult}
                  undoPick={undoPick}
                  docId={docId || searchResult?.file_idx}
                  fileName={fileName}
                  fileMeta={fileMeta}
                  answerTypes={answerTypes}
                  detailEditMode={detailEditMode}
                  showResult={showResult}
                  saveNewAnswer={saveNewAnswer}
                  selectedRowKey={selectedRowKey}
                  setSelectedRowKey={setSelectedRowKey}
                  itemIndex={searchResults.indexOf(searchResult)}
                  selectedSearchCriteria={selectedSearchCriteria}
                  searchResults={searchResults}
                  docActiveTabKey={
                    isSearchPage ? 'search' : from ? from : 'search'
                  }
                  showOnlyTopAnswer={showOnlyTopAnswer}
                  setShowOnlyTopAnswer={setShowOnlyTopAnswer}
                  fieldBundleId={fieldBundleId}
                ></SearchResultItem>
              </Suspense>
            )}
          />
        </div>
      </Spin>
    </div>
  );
}
