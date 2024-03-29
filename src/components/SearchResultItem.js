import {
  ApartmentOutlined,
  AppstoreAddOutlined,
  ArrowRightOutlined,
  ArrowUpOutlined,
  AuditOutlined,
  BlockOutlined,
  CheckCircleOutlined,
  CheckOutlined,
  ClearOutlined,
  CloseCircleOutlined,
  CloseOutlined,
  CopyOutlined,
  EditOutlined,
  EllipsisOutlined,
  FileOutlined,
  FileTextOutlined,
  InsertRowLeftOutlined,
  MergeCellsOutlined,
  MoreOutlined,
  PushpinOutlined,
  QuestionCircleOutlined,
  SaveOutlined,
  ToolOutlined,
  UndoOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { makeStyles } from '@material-ui/styles';
import {
  Button,
  Card,
  Collapse,
  Dropdown,
  Input,
  List,
  message,
  Modal,
  Radio,
  Row,
  Space,
  Spin,
  Statistic,
  Tooltip,
  Typography,
} from 'antd';
import { useContext, useEffect, useRef, useState } from 'react';
import AppContext from '../contexts/app/AppContext';
import DocumentContext from '../contexts/document/DocumentContext';
import useUserInfo from '../hooks/useUserInfo';
import usePageHelper from '../pages/hooks/usePageHelper';
import { saveSearchResult } from '../utils/apiCalls';
import {
  answerTypeKey,
  groupDescriptions,
  groupTypes,
  roles,
} from '../utils/constants';
import {
  copyResultToClipboard,
  hasHeaderHierarchy,
  renderBreadCrumbHeaders,
  renderHeader,
  renderHeaderHierarchy,
  renderPageNumber,
  renderResult,
} from '../utils/helpers';
import { formatMoney } from '../utils/valueFormatters';
import AlternativeQuestionsForm from './AlternativeQuestionsForm';
import SearchResultCard from './common/SearchResultCard';
import { WorkspaceContext } from './WorkspaceContext';

const { Panel } = Collapse;
const { TextArea } = Input;

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
    paddingRight: '15px',
    paddingLeft: '0px',
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
  },
});

// TODO: Reduce functional complexity
export default function SearchResultItem({
  // nosonar
  searchResult,
  detailVisible,
  removeAnswer,
  saveNewAnswer,
  pickResult,
  showResult,
  docId: documentId,
  fileName,
  fileMeta,
  selectedRowKey,
  setSelectedRowKey,
  selectedSearchCriteria,
  itemIndex,
  searchList,
  answerLabel,
  answerTypes,
  detailEditMode = false,
  undoPick,
  title,
  icon,
  hideAnswer,
  openFileLinkLabel = 'Open',
  hiliteEntityTypes = [],
  docActiveTabKey,
  showOnlyTopAnswer,
  setShowOnlyTopAnswer,
  fieldBundleId,
  viewId,
}) {
  const classes = useStyles();
  const savePickButtonWrapperRef = useRef(null);
  const workspaceContext = useContext(WorkspaceContext);
  const { isChattyPdf, isEDGAR } = useContext(AppContext);
  const { showDocument, isDrawerOpen } = useContext(DocumentContext);
  const [saving, setSaving] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [answerEditMode, setAnswerEditMode] = useState(false);
  const [answerEdited, setAnswerEdited] = useState(false);
  // eslint-disable-next-line
  const [questionFormVisible, setQuestionFormVisible] = useState(false); // nosonar
  const [editedAnswer, setEditedAnswer] = useState(null);
  const [originalAnswer] = useState(searchResult.answer);
  const [originalFormattedAnswer] = useState(searchResult.formatted_answer);
  const [associateModalOpen, setAssociateModalOpen] = useState(false);
  const { isDocumentPage, isSearchPage, isWorkspaceSearchPage } =
    usePageHelper();
  const { data: userInfo } = useUserInfo();
  const groupIcons = {
    single: <CheckOutlined />,
    same_answer: <MergeCellsOutlined />,
    similar_answer: <BlockOutlined />,
    same_location: <ApartmentOutlined />,
    list_item: <UnorderedListOutlined />,
    table: <InsertRowLeftOutlined />,
    header_summary: <EllipsisOutlined />,
  };

  const isDocumentDisplayed = isDocumentPage || isDrawerOpen;
  const isOnlySearch = isChattyPdf() || isEDGAR();

  useEffect(() => {
    setEditedAnswer(null);
  }, [searchResult]);

  useEffect(() => {
    savePickButtonWrapperRef.current?.focus();
  }, [searchResult]);

  const handleTextSelection = () => {
    let text = '';
    if (window.getSelection) {
      text = window.getSelection().toString();
    }
    if (text.trim() !== '') {
      text = text.trim();
      setSelectedText(text);
      if (answerEditMode) {
        searchResult.formatted_answer = text;
        searchResult.answer = text;
        setAnswerEdited(true);
      }
    } else {
      setSelectedText('');
    }
  };

  // Renders secondary answers and their quotes
  const renderSecondLevelAnswerBlock = currentSearchResult => {
    let answerText = '';
    let collapseHeaderClass = null;
    let showHeaderInHeader =
      currentSearchResult.group_type === groupTypes.SIMILAR_ANSWER ||
      currentSearchResult.group_type === groupTypes.SAME_ANSWER;
    let hideAnswerInHeader =
      currentSearchResult.group_type === groupTypes.SAME_ANSWER;

    if (currentSearchResult.answer) {
      answerText =
        currentSearchResult.formatted_answer || currentSearchResult.answer;
      collapseHeaderClass = 'title-level-7';
    } else {
      answerText = currentSearchResult.phrase;
      collapseHeaderClass = classes.secondLevelNoAnswerTitle;
    }

    return (
      <div className="search-result-item--sec-level-ans-div">
        <div className="search-result-item--collapse-div">
          <Collapse
            expandIconPosition={'left'}
            bordered={false}
            ghost={true}
            onChange={() => {
              if (
                selectedRowKey != currentSearchResult.match_idx &&
                setSelectedRowKey
              ) {
                setSelectedRowKey(currentSearchResult.match_idx);
              }
            }}
          >
            <Panel
              header={
                <>
                  <div
                    className="search-result-item--panel-header"
                    onClick={e => {
                      if (setSelectedRowKey) {
                        setSelectedRowKey(currentSearchResult.match_idx);
                      }
                      showResult(currentSearchResult);
                      e.stopPropagation();
                    }}
                  >
                    {!hideAnswerInHeader ? (
                      <div className={collapseHeaderClass}>{answerText}</div>
                    ) : (
                      ' '
                    )}
                    {showHeaderInHeader ? (
                      <div>
                        {hasHeaderHierarchy(currentSearchResult) && (
                          <span className="nlm-section-1">
                            {renderHeaderHierarchy(currentSearchResult)}
                          </span>
                        )}
                        <h4 className={classes.answerHeader}>
                          {renderHeader(currentSearchResult)}
                        </h4>
                      </div>
                    ) : (
                      ' '
                    )}
                  </div>
                </>
              }
            >
              <div
                onClick={e => {
                  showResult(currentSearchResult);
                  e.stopPropagation();
                }}
              >
                {renderResult(
                  workspaceContext,
                  currentSearchResult,
                  hiliteEntityTypes
                )}
                {!!currentSearchResult.matches &&
                  currentSearchResult.matches[0].page_idx !==
                    currentSearchResult.matches[1].page_idx && (
                    <div className="search-result-item--pg-headers">
                      {renderPageNumber(currentSearchResult)}
                      {renderBreadCrumbHeaders(currentSearchResult)}
                    </div>
                  )}
              </div>
            </Panel>
          </Collapse>
        </div>
      </div>
    );
  };

  // Shows the quote and where it's from
  const renderAnswerBlock = (
    currentSearchResult,
    hiliteEntityTypesList = hiliteEntityTypes
  ) => {
    if (currentSearchResult.group_type !== 'same_location') {
      return (
        <>
          <div
            onMouseUp={handleTextSelection}
            onMouseDown={handleTextSelection}
          >
            {renderResult(
              workspaceContext,
              currentSearchResult,
              hiliteEntityTypesList
            )}
            {!currentSearchResult.matches ? (
              <div className="search-result-item--pg-headers">
                {renderPageNumber(currentSearchResult)}
                {renderBreadCrumbHeaders(currentSearchResult)}
              </div>
            ) : (
              <></>
            )}
          </div>
        </>
      );
    }
  };

  const renderSecondLevelItem = currentSearchResult => {
    return (
      <List.Item
        className={
          currentSearchResult.match_idx === selectedRowKey
            ? 'second-level-list-row-selected'
            : 'search-result-item--sec-level-ans-list'
        }
      >
        {renderSecondLevelAnswerBlock(currentSearchResult)}
      </List.Item>
    );
  };

  const renderSecondLevel = fact => {
    return fact.matches ? (
      <List
        itemLayout="horizontal"
        className={classes.secondLevelList}
        dataSource={fact.matches.slice(0)}
        renderItem={renderSecondLevelItem}
      />
    ) : (
      ''
    );
  };

  // Save the answer
  const saveItem = async (currentSearchResult, action) => {
    setSaving(true);
    await saveSearchResult(
      workspaceContext,
      workspaceContext.currentWorkspaceId,
      documentId,
      currentSearchResult,
      selectedSearchCriteria,
      action
    );
    setSaving(false);
  };

  const saveNewQuestions = async (currentSearchResult, questions) => {
    setQuestionFormVisible(false);
    setSaving(true);
    for (let question of questions) {
      await saveSearchResult(
        workspaceContext,
        workspaceContext.currentWorkspaceId,
        documentId,
        currentSearchResult,
        { criterias: [{ question: question }] },
        'entered'
      );
    }
    setSaving(false);
    setAssociateModalOpen(false);
  };

  // Gets the group description
  const getGroupDescription = groupType => {
    if (title) return title;
    if (!searchResult.answer) searchResult.answer = '';
    if (searchResult.is_override || searchResult.is_picked) {
      return '';
    }
    // Answser is the first answer
    if (
      searchResult.answer !== '' &&
      itemIndex === 0 &&
      groupType === 'single'
    ) {
      return 'Best answer';
    }
    // Matching text terms in a list
    else if (
      searchResult.answer === '' &&
      searchResult.formatted_answer === '' &&
      searchResult.match_text_terms.length !== 0 &&
      groupType === 'list_item'
    ) {
      return 'Has matching keywords in list';
    }
    // Picked because of matching text terms
    else if (
      searchResult.answer === '' &&
      searchResult.formatted_answer === '' &&
      searchResult.match_text_terms.length !== 0
    ) {
      return 'Has matching keywords';
    }
    // Picked because of semantic matches
    else if (
      searchResult.answer === '' &&
      searchResult.formatted_answer === '' &&
      searchResult.match_text_terms.length === 0 &&
      searchResult.match_semantic_terms.length !== 0
    ) {
      return 'Has related words';
      // Picked because of header matches
    } else if (
      searchResult.answer === '' &&
      searchResult.formatted_answer === '' &&
      searchResult.match_text_terms.length === 0 &&
      searchResult.match_semantic_terms.length === 0
    ) {
      if (searchResult.header_text_terms) {
        return 'Has matching keywords in header';
      } else if (searchResult.header_semantic_terms) {
        return 'Has related words in header';
      }
      // Uses the look-up
      // use group description first
    } else if (groupType && groupDescriptions[groupType]) {
      return groupDescriptions[groupType];
    }
  };

  // Gets the group icon
  const getGroupIcon = groupType => {
    if (searchResult.answer === '') {
      return <FileTextOutlined />;
    } else if (icon) {
      return icon;
    } else {
      return groupIcons[groupType];
    }
  };

  const getTopAnswerLabel = () => {
    let label = '';
    if (answerLabel && !searchResult.is_picked && !searchResult.is_override) {
      label = <span>{answerLabel}</span>;
    } else if (searchResult.is_picked) {
      label = (
        <Space>
          <AuditOutlined />
          <span>Picked</span>
        </Space>
      );
    } else if (searchResult.is_override) {
      label = (
        <Space>
          <AuditOutlined />
          <span>Audited</span>
        </Space>
      );
    } else if (searchResult.status === 'approve') {
      label = (
        <Space>
          <CheckOutlined />
          <span>Approved</span>
        </Space>
      );
    }
    return label;
  };

  const clearFieldValue = () => {
    setAnswerEdited(false);
    searchResult.formatted_answer = '';
    searchResult.answer = '';
    window.getSelection().empty();
    setSelectedText('');
    setEditedAnswer('');
  };

  const clearFieldEdit = () => {
    setAnswerEdited(false);
    searchResult.answer = originalAnswer;
    searchResult.formatted_answer = originalFormattedAnswer;
    setEditedAnswer(null);
  };

  const getScoreColor = score => {
    let color = '';
    if (score > 0.85) {
      color = '#e4fbd8'; //"green";
    } else if (score > 0.5 && score <= 0.85) {
      color = '#f7e7c6'; //"orange";
    } else if (score < 0.5 && score > 0.3) {
      color = '#f5c8cb'; //yellow";
    } else if (isNaN(score)) {
      color = '#e4fbd8';
    } else {
      color = '#f5c8cb';
    }
    return color;
  };

  const answerEditControls = (
    <Space>
      <Tooltip title="Clear this answer">
        <Button
          size="small"
          type="link"
          icon={<ClearOutlined />}
          onClick={e => {
            clearFieldValue();
            e.stopPropagation();
          }}
        />
      </Tooltip>
      <Tooltip title="Revert back to original answer">
        <Button
          size="small"
          type="link"
          icon={<CloseOutlined />}
          onClick={e => {
            clearFieldEdit();
            e.stopPropagation();
          }}
        />
      </Tooltip>
      <Tooltip title="Exit edit mode and save any changes made">
        <Button
          size="small"
          type="link"
          icon={<CheckOutlined />}
          onClick={() => {
            if (answerEditMode && answerEdited) {
              searchResult.original_answer = originalAnswer;
              searchResult.original_formatted_answer = originalFormattedAnswer;
              saveItem(searchResult, 'edited');
            }
            setAnswerEditMode(!answerEditMode);
          }}
        />
      </Tooltip>
    </Space>
  );

  // Shows the quoted text in file
  const showInFile = e => {
    if (!selectedText && !answerEditMode) {
      if (setSelectedRowKey) {
        setSelectedRowKey(searchResult.match_idx);
      }
      showResult(searchResult);
    }

    const fieldNameObj = {
      ...(docActiveTabKey === 'fields'
        ? { fieldName: searchResult?.fieldName }
        : {}),
    };

    !isDrawerOpen &&
      showDocument({
        documentId,
        documentTitle: fileName,
        docActiveTabKey,
        ...fieldNameObj,
        showAlternateAnswers: detailVisible,
        fieldBundleId,
        documentIds:
          (isSearchPage || isWorkspaceSearchPage) &&
          workspaceContext?.searchResults?.fileFacts.map(
            ({ fileIdx }) => fileIdx
          ),
        viewId,
      });

    if (e.stopPropagation) {
      e.stopPropagation();
    }
  };

  // Creates a list of the actions that a user can do depending on the situation and user role
  // TODO: Reduce the complexity of this function in the future
  const getSearchResultActions = currentSearchResult => {
    // nosonar
    let actions = [];
    // Viewer allowed actions
    if (workspaceContext.currentUserRole === roles.VIEWER) {
      if (searchList) {
        let currentUserName = userInfo?.firstName + ' ' + userInfo?.lastName;
        if (currentUserName === answerLabel) {
          actions = [
            <Tooltip key="remove">
              <Button onClick={() => removeAnswer(currentSearchResult)}>
                Remove
              </Button>
            </Tooltip>,
          ];
        } else {
          actions = [];
        }
      }
    } else {
      if (searchList) {
        actions = [
          <Tooltip key="remove">
            <Button onClick={() => removeAnswer(currentSearchResult)}>
              Remove
            </Button>
          </Tooltip>,
        ];
      }
    }
    if (detailVisible) {
      if (
        currentSearchResult.is_override ||
        currentSearchResult['type'] === 'approve'
      ) {
        actions = [
          <Tooltip
            key="remove-answer"
            title={
              currentSearchResult.is_override
                ? 'Replace your pick with best answer from system'
                : 'Undo approval'
            }
          >
            <Button
              type="link"
              onClick={e => {
                if (removeAnswer) {
                  removeAnswer();
                }
                e.stopPropagation();
              }}
              size="small"
              danger
            >
              {currentSearchResult.is_override ? 'Remove Audit' : 'Unapprove'}
            </Button>
          </Tooltip>,
        ];
      } else if (itemIndex !== 0) {
        actions = [
          <Tooltip title="Replace field value with this" key="pick-field-value">
            <Button
              type="link"
              icon={<ArrowUpOutlined />}
              onClick={e => {
                if (pickResult) {
                  pickResult(currentSearchResult);
                }
                message.success(
                  "Field value picked, click on 'save pick' to commit your change!"
                );
                e.stopPropagation();
              }}
              size="small"
            >
              Pick as Field Value
            </Button>
          </Tooltip>,
        ];
      } else {
        if (currentSearchResult.is_picked) {
          actions = [
            <Tooltip key="save-pick">
              <div ref={savePickButtonWrapperRef} tabIndex={0}>
                <Button
                  icon={<SaveOutlined></SaveOutlined>}
                  type="primary"
                  onClick={() => saveNewAnswer()}
                >
                  Save Pick
                </Button>
              </div>
            </Tooltip>,
          ];
          actions.push(
            <Tooltip>
              <Button
                icon={<UndoOutlined></UndoOutlined>}
                type="link"
                onClick={() => undoPick()}
              >
                Undo Pick
              </Button>
            </Tooltip>
          );
        } else {
          actions = [
            <Tooltip key="approve">
              <Button
                icon={<CheckOutlined></CheckOutlined>}
                type="link"
                onClick={() => saveNewAnswer()}
              >
                Approve
              </Button>
            </Tooltip>,
          ];
        }
      }
    }
    return actions;
  };

  // Calculates the value to go into the Statistic component
  const statisticValue = !isNaN(searchResult.scaled_score)
    ? searchResult.scaled_score * 100
    : 'N/A';

  // Displays the radio stuff if you can edit a Yes/No answer
  const editAnswer = () => {
    if (
      answerEditMode &&
      answerTypes &&
      answerTypes.length > 0 &&
      answerTypeKey.YES_NO === answerTypes[0]
    ) {
      return (
        <Radio.Group
          size="small"
          buttonStyle="solid"
          value={editedAnswer || searchResult.formatted_answer}
          onChange={e => {
            let selectedValue = e.target.value;
            let answerChanged = searchResult.formatted_answer !== selectedValue;
            setEditedAnswer(answerChanged ? selectedValue : null);
            setAnswerEdited(answerChanged);
            searchResult.formatted_answer = answerChanged
              ? selectedValue
              : originalFormattedAnswer;
            searchResult.answer = answerChanged
              ? selectedValue
              : originalAnswer;
          }}
        >
          <Radio.Button value="Yes">Yes</Radio.Button>
          <Radio.Button value="No">No</Radio.Button>
          <Radio.Button value="">Neutral</Radio.Button>
        </Radio.Group>
      );
    } else if (
      answerTypes &&
      answerTypes.length > 0 &&
      'money' === answerTypes[0] &&
      searchResult.answer_details
    ) {
      return <>{formatMoney(searchResult)}</>;
    } else {
      // Adding a fallback check to avoid errors for some stale/invalid values
      return (
        <>
          {typeof searchResult.formatted_answer === 'object'
            ? ''
            : searchResult.formatted_answer}
        </>
      );
    }
  };

  // Determines how to display the formatted answer
  const displayFormattedAnswer =
    detailEditMode && itemIndex === 0 ? (
      <>
        <TextArea
          autoSize={{ minRows: 1, maxRows: 5 }}
          value={editedAnswer || searchResult.formatted_answer}
          defaultValue={searchResult.formatted_answer}
          onChange={e => {
            let text = e.target.value;
            setEditedAnswer(text);
          }}
          onClick={e => e.stopPropagation()}
        />
        {answerEditControls}
      </>
    ) : (
      editAnswer()
    );

  // Displays the answer edit controls if in edit mode
  const displayAnswerEditControls = () => {
    if (answerEditMode) {
      return <div>{answerEditControls}</div>;
    }
  };

  // Handles a menu selection
  const handleMenuClick = e => {
    if (e.key === 'correct') {
      saveItem(searchResult, 'correct');
    } else if (e.key === 'incorrect') {
      saveItem(searchResult, 'incorrect');
    } else if (e.key === 'edit') {
      if (answerEditMode && answerEdited) {
        searchResult.original_answer = originalAnswer;
        searchResult.original_formatted_answer = originalFormattedAnswer;
        saveItem(searchResult, 'edited');
      }
      setAnswerEditMode(!answerEditMode);
    } else if (e.key === 'assign') {
      setAssociateModalOpen(true);
    } else if (e.key === 'bookmark') {
      saveItem(searchResult, 'bookmark');
    } else if (e.key === 'copy') {
      copyResultToClipboard(searchResult);
    } else if (e.key === 'open') {
      showInFile(e);
    } else {
      console.warn('Option not found: ', e.key);
    }
  };

  // Renders the menu
  const actionMenu = (
    <Space size="small">
      {!(searchResult.is_picked || searchResult.is_override) ? (
        <>
          <Dropdown
            menu={{
              onClick: handleMenuClick,
              items: [
                {
                  key: 'training',
                  label: 'Train',
                  icon: <ToolOutlined />,
                  children: [
                    {
                      key: 'correct',
                      label: 'Answer is correct',
                      icon: <CheckCircleOutlined />,
                    },
                    {
                      key: 'incorrect',
                      label: 'Answer does not exist in passage',
                      icon: <CloseCircleOutlined />,
                    },
                    {
                      key: 'edit',
                      label: 'Edit answer',
                      icon: <EditOutlined />,
                    },
                    {
                      key: 'assign',
                      label: 'Associate alternative questions to this answer',
                      icon: <AppstoreAddOutlined />,
                    },
                  ],
                },
                {
                  key: 'bookmark',
                  label: 'Pin',
                  icon: <PushpinOutlined />,
                },
                {
                  key: 'copy',
                  label: 'Copy Answer',
                  icon: <CopyOutlined />,
                },
                ...(isDrawerOpen
                  ? []
                  : [
                      {
                        key: 'open',
                        label: 'Show in File',
                        icon: <FileOutlined />,
                      },
                    ]),
              ],
            }}
            trigger={['click']}
            autosize={false}
            placement={detailVisible ? 'bottomRight' : 'bottomLeft'}
          >
            <div className="search-result-item--dropdown">
              <Button
                size="medium"
                className="search-result-item--action-button"
                onClick={e => e.preventDefault()}
                icon={
                  <MoreOutlined className="search-result-item--action-button-icon" />
                }
              />
            </div>
          </Dropdown>
          {searchResult?.criteria_question && (
            <Tooltip title={searchResult.criteria_question}>
              <QuestionCircleOutlined />
            </Tooltip>
          )}
        </>
      ) : (
        <></>
      )}
      {isDocumentDisplayed && (
        <Button
          size="medium"
          type="link"
          icon={<ArrowRightOutlined />}
          onClick={e => {
            if (isDrawerOpen) {
              showInFile(e);
            }
          }}
        ></Button>
      )}
    </Space>
  );

  // Finds the document where the quoted text is from
  const currentDoc = workspaceContext.documents.find(doc => {
    return doc.id === documentId;
  });

  // Creates the card's description that goes in the title
  const answerDescription = () => {
    return (
      <Space>
        {getGroupIcon(searchResult.group_type)}
        <span className={classes.groupTypeDescription}>
          {getGroupDescription(searchResult.group_type)}
        </span>
      </Space>
    );
  };

  // Shows the file name, and limits the characters if the name is too long
  const showFileName = () => {
    if (currentDoc) {
      if (currentDoc.name.length > 20) {
        return 'Show in ' + currentDoc.name.slice(0, 20) + '...';
      } else {
        return 'Show in ' + currentDoc.name;
      }
    }
  };

  const openFileLink = (
    <Tooltip title={showFileName()}>
      <Button
        icon={<ArrowRightOutlined />}
        // shape='circle'
        size="small"
        type="link"
        onClick={showInFile}
        className="search-result-item--file-button"
      >
        {openFileLinkLabel}
      </Button>
    </Tooltip>
  );

  // Creates the card's title
  const cardTitle = () => {
    return (
      <div className="search-result-item--card-title">
        {!hideAnswer ? (
          <>
            {!answerLabel &&
              !searchResult.is_picked &&
              !searchResult.is_override &&
              answerDescription()}
            {itemIndex === 0 && !answerLabel && (
              <div>{getTopAnswerLabel()}</div>
            )}
            {answerLabel && <div>{answerLabel}</div>}
          </>
        ) : (
          <>{openFileLink}</>
        )}
        <div style={{ display: 'flex' }}>
          {!hideAnswer &&
            !isDocumentDisplayed &&
            !searchResult.is_override &&
            !searchResult.is_picked && <>{openFileLink}</>}
          {!isNaN(searchResult.scaled_score) && (
            <div
              className="nlm-score"
              style={{
                backgroundColor: getScoreColor(searchResult.scaled_score),
                color: 'black',
              }}
            >
              <Statistic
                className="search-result-item--statistic"
                value={statisticValue}
                precision={0}
                suffix="%"
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <Modal
        title="Alternative Questions"
        open={associateModalOpen}
        onCancel={() => setAssociateModalOpen(false)}
        footer={null}
      >
        <AlternativeQuestionsForm
          onSave={questions => saveNewQuestions(searchResult, questions)}
          onCancel={() => setAssociateModalOpen(false)}
        ></AlternativeQuestionsForm>
      </Modal>
      <List.Item
        className={
          searchResult.match_idx === selectedRowKey
            ? 'search-result-item--list-selected'
            : 'search-result-item--list'
        }
        id={searchResult.unique_id}
      >
        <Spin
          spinning={saving}
          wrapperClassName="nlm-searchResultItem"
          style={{ flex: '0 0 100%' }}
        >
          <div
            className={
              searchResult.match_idx === selectedRowKey
                ? 'search-result-item--card-wrapper-selected'
                : 'search-result-item--card-wrapper'
            }
          >
            {(isSearchPage || isWorkspaceSearchPage) && !isDocumentDisplayed ? (
              searchResult.block_type === 'summary' ? (
                <Typography.Title
                  level={5}
                  copyable
                  style={{ padding: '15px 10px' }}
                >
                  {searchResult.answer}
                </Typography.Title>
              ) : (
                <SearchResultCard
                  docId={documentId}
                  fileName={fileName}
                  fileMeta={fileMeta}
                  searchResult={searchResult}
                  showInFile={showInFile}
                  hideAnswer={hideAnswer}
                  answerEdited={answerEdited}
                  displayFormattedAnswer={displayFormattedAnswer}
                  renderAnswerBlock={renderAnswerBlock}
                  renderSecondLevel={renderSecondLevel}
                  renderPageNumber={renderPageNumber}
                  renderBreadCrumbHeaders={renderBreadCrumbHeaders}
                  showOnlyTopAnswer={showOnlyTopAnswer}
                  setShowOnlyTopAnswer={setShowOnlyTopAnswer}
                  itemIndex={itemIndex}
                />
              )
            ) : (
              <Card
                size="small"
                className={
                  documentId
                    ? isOnlySearch
                      ? 'is-only-search'
                      : ''
                    : 'search-result-item--card'
                }
                title={isOnlySearch ? null : cardTitle()}
                actions={getSearchResultActions(searchResult)}
                extra={
                  (isSearchPage && isDocumentDisplayed) || isOnlySearch
                    ? null
                    : actionMenu
                }
                {...(isOnlySearch
                  ? {
                      onClick: e => {
                        if (isDrawerOpen) {
                          showInFile(e);
                        }
                      },
                    }
                  : {})}
              >
                <div
                  className={
                    searchResult.answer !== ''
                      ? 'search-result-item--card-body'
                      : 'search-result-item--card-body-no-ans'
                  }
                >
                  <div className="search-result-item--ans-edit-ctls" />
                  {!(
                    searchResult.group_type === groupTypes.SAME_LOCATION ||
                    searchResult.group_type === groupTypes.LIST_ITEM ||
                    searchResult.group_type === groupTypes.HEADER_SUMMARY
                  ) &&
                  ((searchResult.table &&
                    searchResult.table.rows.length < 3 &&
                    searchResult.table.cols.length < 3) ||
                    !searchResult.table) &&
                  (searchResult.formatted_answer ||
                    searchResult.formatted_answer === '') ? (
                    <>
                      <Typography.Title level={5}>
                        {(!hideAnswer || answerEdited) &&
                          displayFormattedAnswer}
                        {displayAnswerEditControls()}
                      </Typography.Title>
                    </>
                  ) : (
                    <></>
                  )}
                  <>{renderAnswerBlock(searchResult)}</>
                </div>
                <Row className="search-result-item--sec-level">
                  {renderSecondLevel(searchResult)}
                </Row>
                {!!searchResult.matches && (
                  <div className="search-result-item--pg-headers">
                    {renderPageNumber(searchResult)}
                    {renderBreadCrumbHeaders(searchResult)}
                  </div>
                )}
              </Card>
            )}
          </div>
        </Spin>
      </List.Item>
    </>
  );
}
