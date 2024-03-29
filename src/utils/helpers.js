import { BulbOutlined } from '@ant-design/icons';
import {
  Alert,
  Breadcrumb,
  Button,
  message,
  Popover,
  Table,
  Tag,
  Typography,
} from 'antd';
import { createElementsFromText } from 'html-text-to-react';
import Highlighter from 'react-highlight-words';
import {
  answerTypeDescriptions,
  BIO_ENTITY_LABEL_CONFIG,
  dataTypes,
  displayFormats,
  GENERAL_ENTITY_LABEL_CONFIG,
  questionTipsDataSource,
} from '../utils/constants';
import { findDocumentById, showError } from './apiCalls.js';
import FreeTrialExpiryNotification from '../chatty-pdf/components/FreeTrialExpiryNotification';

const { Text } = Typography;
const questionTipsColumns = [
  {
    title: 'Expected Answer Type',
    dataIndex: 'expected',
    key: 'expected',
  },
  {
    title: 'Example Question',
    key: 'question',
    dataIndex: 'question',
    render: (text, record) => (
      <span>
        <b>{record.questionStart}</b> {text}
      </span>
    ),
  },
];
export const questionTipsContent = (
  <div>
    <Table
      dataSource={questionTipsDataSource}
      columns={questionTipsColumns}
      size="small"
      pagination={false}
    />
  </div>
);
const fieldSuffixes = [
  '_passage',
  '_formatted_answer',
  '_answer',
  '_header_text',
  '_scr',
  '_action',
];

export const replaceFieldSuffix = fieldName => {
  if (fieldName) {
    for (let suffix of fieldSuffixes) {
      if (fieldName.endsWith(suffix)) {
        fieldName = fieldName.replace(suffix, '');
        break;
      }
    }
  }
  return fieldName;
};

export const isValidCriteria = searchCriteria => {
  return (
    searchCriteria &&
    searchCriteria.criterias &&
    searchCriteria.criterias.length > 0
  );
};

export const getDataType = (fieldDefinition, options) => {
  let dataType = null;
  let answerType = null;
  if (fieldDefinition && fieldDefinition.dataType) {
    dataType = fieldDefinition.dataType;
  }
  if (options && options.answer_type) {
    answerType = options.answer_type;
  }
  if (dataType === 'list') {
    dataType = dataTypes.LIST;
  } else if (dataType === 'date' || answerType === 'NUM:date') {
    dataType = dataTypes.DATE;
  } else if (answerType === 'NUM:period') {
    dataType = dataTypes.PERIOD;
  } else if (
    answerType === 'NUM:money' ||
    options?.numberType === dataTypes.MONEY
  ) {
    dataType = dataTypes.MONEY;
  } else if (
    dataType === 'number' ||
    answerType === 'NUM:count' ||
    answerType === 'NUM:perc'
  ) {
    dataType = dataTypes.NUMBER;
  } else if (options && options.data_type === 'boolean') {
    dataType = dataTypes.BOOLEAN;
  } else {
    dataType = dataTypes.TEXT;
  }
  return dataType;
};

export const getDataTypeFromAnswerType = answerType => {
  let dataType = null;
  if (answerType === 'NUM:date') {
    dataType = dataTypes.DATE;
  } else if (answerType === 'NUM:period') {
    dataType = dataTypes.PERIOD;
  } else if (answerType === 'NUM:money') {
    dataType = dataTypes.MONEY;
  } else if (answerType === 'NUM:count' || answerType === 'NUM:perc') {
    dataType = dataTypes.NUMBER;
  } else if (answerType === 'bool') {
    dataType = dataTypes.BOOLEAN;
  } else {
    dataType = dataTypes.TEXT;
  }
  return dataType;
};

export const getCriteriaMessage = (searchCriteria, answerTypes, showTips) => {
  if (isValidCriteria(searchCriteria)) {
    if (answerTypes.length > 0) {
      //criteria has questions
      return (
        <Alert
          message={'Q: ' + searchCriteria.criterias[0].question}
          description={
            <span>
              Expects <b>{answerTypes.join(', ')}</b> as answer
            </span>
          }
          action={
            showTips && (
              <Popover content={questionTipsContent} title="Question Tips">
                <Button
                  type="text"
                  size="small"
                  icon={<BulbOutlined></BulbOutlined>}
                >
                  Tips
                </Button>
              </Popover>
            )
          }
        ></Alert>
      );
    } else if (searchCriteria.criterias[0].question) {
      //keyword search
      return (
        <Alert
          message={'Keywords: ' + searchCriteria.criterias[0].question}
          description={<span>Showing keyword search results</span>}
        >
          {/* action={
          <Popover content={questionTipsContent} title="Question Tips">
            <Button type="text" size="small" color="green" icon={<BulbOutlined></BulbOutlined>}>Tips</Button>
          </Popover>
        } */}
        </Alert>
      );
    } else if (
      searchCriteria.criterias[0].headers &&
      searchCriteria.criterias[0].headers.length > 0
    ) {
      return (
        <Alert
          message={'headers: ' + searchCriteria.criterias[0].headers.join(', ')}
          description={<span>Showing header search results</span>}
        >
          {/* action={
          <Popover content={questionTipsContent} title="Question Tips">
            <Button type="text" size="small" color="green" icon={<BulbOutlined></BulbOutlined>}>Tips</Button>
          </Popover>
        } */}
        </Alert>
      );
    } else {
      return (
        <Alert message={'Search criteria not specified'} type="error"></Alert>
      );
    }
  } else {
    return (
      <Alert message={'Type question or keywords into the search bar'}></Alert>
    );
  }
};

export const highlightInPhrase = (answer, phrase, className) => {
  if (!answer) return phrase;
  return phrase.replace(
    new RegExp(
      /* eslint-disable no-useless-escape */
      answer.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&'),
      'gi'
    ),
    regMatch => `<span class=${className}>${regMatch}</span>`
  );
};

export const showResultInDocument = (
  workspaceContext,
  prevBlock,
  selectedBlock,
  block_idx = 'block_idx',
  block_text = 'block_text', //eslint-disable-line no-unused-vars
  answer_field = 'answer'
) => {
  workspaceContext.setSearchPDF([
    selectedBlock['page_idx'],
    {
      selectedBlock: selectedBlock,
      phraseSearch: true,
      caseSensitive: false,
      entireWord: false,
      highlightAll: false,
      findPrevious: undefined,
    },
  ]);
  if (workspaceContext.scrollIntoView) {
    workspaceContext.scrollIntoView(
      prevBlock,
      selectedBlock,
      block_idx,
      answer_field
    );
  } else {
    console.warn('showResultsInDocument could not be executed');
  }
};

export const cloneSearchCritera = searchCriteria => {
  let clonedCriteria = {};
  console.log('cloning criterias', searchCriteria);
  clonedCriteria.question = searchCriteria.question;
  clonedCriteria.fieldName = searchCriteria.fieldName;
  clonedCriteria.sectionHeading = searchCriteria.sectionHeading;
  clonedCriteria.criterias = [];
  for (let criteria of searchCriteria.criterias) {
    clonedCriteria.criterias.push({
      question: criteria.question,
      templates: criteria.templates,
      headers: criteria.headers,
      additionalQuestions: criteria.additionalQuestions,
      expectedAnswerType: criteria.expectedAnswerType,
      groupFlag: criteria.groupFlag,
      tableFlag: criteria.tableFlag,
      pageStart: criteria.pageStart,
      pageEnd: criteria.pageEnd,
      beforeContextWindow: criteria.beforeContextWindow,
      afterContextWindow: criteria.afterContextWindow,
      criteriaRank: criteria.criteriaRank,
    });
  }
  clonedCriteria.postProcessors = searchCriteria.postProcessors
    ? searchCriteria.postProcessors
    : [];
  clonedCriteria.aggregatePostProcessors = searchCriteria.aggregateProcessors
    ? searchCriteria.aggregateProcessors
    : [];
  clonedCriteria.topn = searchCriteria.topn;
  clonedCriteria.docPerPage = searchCriteria.docPerPage;
  clonedCriteria.offset = 0;
  clonedCriteria.groupByFile = searchCriteria.groupByFile;
  console.log('returning clones search criteria', clonedCriteria);
  return clonedCriteria;
};

export const goToFileSearch = async (user, workspaceContext, file, source) => {
  let fileFacts = [];
  let docId = null;
  if (source === 'relation') {
    docId = file.file_idx;
    fileFacts = [
      {
        fileIdx: file.file_idx,
        fileName: file.file_name,
        expectedAnswerType: undefined,
        criterias:
          workspaceContext.relationSearchResults.fileFacts?.length &&
          workspaceContext.relationSearchResults.fileFacts[0].criterias,
        topicFacts: [file],
      },
    ];
    workspaceContext.setDocSearchResults({ empty: false, results: fileFacts });
  } else {
    docId = file.fileIdx;
    fileFacts = workspaceContext.searchResults.fileFacts.filter(
      fact => fact.fileIdx === docId
    );
    workspaceContext.setDocSearchResults({
      empty: fileFacts.length === 0,
      results: fileFacts,
    });
    workspaceContext.setDocSearchCriteria(
      cloneSearchCritera(workspaceContext.workspaceSearchCriteria)
    );
  }
  workspaceContext.setSearchResultsVisible(true);
  workspaceContext.setWorkspaceSearchMode(false);
  workspaceContext.setFileBrowserSelectedKeys([docId]);
  let currentDocument = findDocumentById(docId, workspaceContext);
  workspaceContext.setCurrentDocument({
    ...currentDocument,
    id: docId,
  });
};

export const emptyResult = docId => {
  return {
    answer: '',
    phrase: '',
    answer_score: 0.0,
    file_idx: docId,
    formatted_answer: '',
    level: 'sent',
    match_idx: -1,
    page_idx: -1,
    match_score: 0.0,
    question_score: 0.0,
    scaled_score: 0.0,
  };
};

export const getFileIdFromName = (workspaceContext, fileName) => {
  let file = { fileIdx: '' };
  for (let fileFact of workspaceContext.searchResults.fileFacts) {
    if (fileFact.fileName === fileName) file.fileIdx = fileFact.fileIdx;
  }
  return file;
};

export const constructFileTreeData = dataArray => {
  return dataArray.map(data => {
    // means it's file
    if (data.docLocation) {
      return { title: data.name, key: data.id, isLeaf: true };
    } else {
      // means it's folder
      return { title: data.name, key: data.id };
    }
  });
};

export const backToGridView = workspaceContext => {
  // workspaceContext.setCurrentDocument({
  //   html: { title: '' },
  //   pdfUrl: '',
  //   json: '',
  //   xml: undefined,
  //   id: 'all'
  // });
  // workspaceContext.setFileBrowserSelectedKeys([])
  workspaceContext.setWorkspaceSearchMode(true);
  workspaceContext.setSearchResultsVisible(false);
};

export const backToDocumentPage = workspaceContext => {
  workspaceContext.setWorkspaceSearchMode(false);
};

const escapeHTML = str => str;

export const copyResultToClipboard = searchResult => {
  const el = document.createElement('textarea');
  let clipboardBuf = [];
  if (searchResult.answer) {
    clipboardBuf.push(searchResult.answer);
  }
  if (searchResult.hierarchy_headers) {
    clipboardBuf.push(searchResult.hierarchy_headers.join(' / '));
  }
  if (Array.isArray(searchResult.phrase)) {
    clipboardBuf.push(searchResult.phrase.join(', '));
  } else {
    clipboardBuf.push(searchResult.phrase);
  }
  if (searchResult.table) {
    let cols = searchResult.table.cols;
    let rows = searchResult.table.rows;
    clipboardBuf.push(cols.join('\t'));
    for (let row of rows) {
      clipboardBuf.push(row.join('\t'));
    }
  }
  el.value = clipboardBuf.join('\n');
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  message.success('Answer copied to clipboard');
};

// TODO: Refactor to lower functional complexity
export const renderResult = (
  workspaceContext,
  searchResult,
  hiliteEntityTypes = []
) => {
  // nosonar
  let cols = [];
  let rows = [];
  let phrase = '';

  // Join the phrases together if there is more than one
  if (Array.isArray(searchResult.phrase)) {
    phrase = escapeHTML(searchResult.phrase.join(', '));
  } else {
    phrase = escapeHTML(searchResult.phrase);
  }

  // Joins the answers together if there is more than one
  let answers = [];
  if (
    searchResult.answer &&
    searchResult.answer !== 'No' &&
    searchResult.answer !== 'Yes'
  ) {
    if (Array.isArray(searchResult.answer)) {
      answers = searchResult.answer;
    } else {
      if (searchResult.answer) {
        if (searchResult?.answer_details?.currency_symbol) {
          answers = String(searchResult.answer).replaceAll(
            searchResult?.answer_details?.currency_symbol,
            ''
          );
          answers = answers ? [answers] : [];
        } else {
          answers = searchResult.answer ? [searchResult.answer] : [];
        }
      } else {
        answers = [];
      }
    }
  }
  answers = answers.map(answer => answer?.toLowerCase());

  const relationHead = searchResult.relation_head;
  const relationTail = searchResult.relation_tail;

  const matchTextTermsLowerCase = searchResult.match_text_terms
    ? searchResult.match_text_terms.map(word => word.toLowerCase())
    : [];

  const matchTextTerms = (matchTextTermsLowerCase || []).flatMap(matchTerm => {
    let matchTextTerms;
    if (matchTerm) {
      // Give preference to answers over keywords when hilighting
      if (answers.some(answer => matchTerm?.includes(answer))) {
        matchTextTerms = [];
      } else {
        matchTextTerms = [matchTerm];
      }
    } else {
      matchTextTerms = [];
    }
    return matchTextTerms;
  });

  const entityWords = (searchResult.entity_list || []).flatMap(entity => {
    let entityWords;
    if (entity) {
      // Give preference to answers and keywords over entities when hilighting
      if (
        matchTextTerms.some(term => entity[0]?.toLowerCase()?.includes(term)) ||
        answers.some(answer => entity[0]?.toLowerCase()?.includes(answer))
      ) {
        entityWords = [];
      } else {
        entityWords = entity[0];
      }
    } else {
      entityWords = [];
    }
    return entityWords;
  });

  const definitionTerms = Object.keys(
    searchResult.cross_references || {}
  ).flatMap(definitionTerm => {
    let definitionTermArray;
    if (definitionTerm) {
      // Give preference to answers and keywords over definitionTerms when hilighting
      if (
        matchTextTerms.some(term =>
          definitionTerm?.toLowerCase()?.includes(term)
        ) ||
        answers.some(answer => definitionTerm?.toLowerCase()?.includes(answer))
      ) {
        definitionTermArray = [];
      } else {
        definitionTermArray = [definitionTerm];
      }
    } else {
      definitionTermArray = [];
    }
    return definitionTermArray;
  });

  const entityToHilightClass = (searchResult.entity_list || []).flatMap(
    entity =>
      hiliteEntityTypes.includes(entity[1][0])
        ? [
            [
              entity[0],
              `nlm-underline nlm-underline-${entity[1][0].replaceAll(
                ':',
                '-'
              )} ${
                matchTextTerms.includes(entity[0].toLowerCase())
                  ? 'keyword-hilite'
                  : ''
              }`,
            ],
          ]
        : []
  );
  const textTermsToHilightClass = matchTextTerms.map(term => [
    term,
    'keyword-hilite',
  ]);

  const relationHeadToHilightClass = (relationHead ? [relationHead] : []).map(
    term => [term, 'answer-in-phrase-mark']
  );

  const relationTailToHilightClass = (relationTail ? [relationTail] : []).map(
    term => [term, 'answer-in-phrase-mark']
  );

  const answerToHilightClass = answers.map(term => [
    term,
    'answer-in-phrase-mark',
  ]);

  const definitionTermsToHilightClass = definitionTerms.map(definitionTerm => [
    definitionTerm,
    'nlm-definition-term',
  ]);

  const entityToHilightClassObj = Object.fromEntries(
    new Map([
      ...entityToHilightClass,
      ...relationHeadToHilightClass,
      ...relationTailToHilightClass,
      ...definitionTermsToHilightClass,
      ...textTermsToHilightClass,
      ...answerToHilightClass,
    ])
  );

  // Set up table for display
  if (searchResult.table) {
    cols = searchResult.table.cols;
    rows = searchResult.table.rows;
    let max_cols = 0;
    for (let row of rows) {
      max_cols = Math.max(row.length, max_cols);
    }
    if (cols.length > 0) {
      let diff = max_cols - cols.length;
      for (let k = 0; k < diff; k++) {
        cols.splice(0, 0, '');
      }
    }
    if (rows.length < 3) {
      var flipped_rows = [];
      for (var i = 0; i < cols.length; i++) {
        let new_row = [cols[i]];
        for (let row of rows) {
          new_row.push(row[i]);
        }
        flipped_rows.push(new_row);
      }
      cols = [];
      rows = flipped_rows;
    }
  }

  const allWords = [
    ...matchTextTerms,
    ...entityWords,
    ...(relationHead ? [relationHead] : []),
    ...(relationTail ? [relationTail] : []),
    ...answers,
    ...definitionTerms,
  ];

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  const wordsToHilight = allWords.flatMap(wordToHilight => [
    new RegExp(`\\b${escapeRegExp(String(wordToHilight))}\\b`), // matches `Some Company Ltd` in `this is Some Company Ltd that does ...`
    new RegExp(`\\b${escapeRegExp(String(wordToHilight))}\\B`), // matches `Some Company Ltd.` in `this is Some Company Ltd. that does ...`
  ]);

  return (
    <>
      {searchResult.parent_text && searchResult.parent_text !== '' && (
        <div style={{ fontSize: '10px' }}>{searchResult.parent_text}</div>
      )}
      <div className="file-search-list-item">
        {!searchResult.table && (
          <p style={{ marginBottom: 5 }}>
            <Highlighter
              highlightClassName={entityToHilightClassObj}
              searchWords={wordsToHilight}
              highlightTag={({ children, className }) => {
                return definitionTerms.includes(children) ? (
                  <Popover
                    className={className}
                    content={
                      searchResult.cross_references[children]?.length > 1 ? (
                        <ul
                          style={{
                            marginLeft: 15,
                            marginBottom: 0,
                          }}
                        >
                          {searchResult.cross_references[children].map(
                            reference => (
                              <li key={reference}>
                                <Typography.Text>{reference}</Typography.Text>
                              </li>
                            )
                          )}
                        </ul>
                      ) : (
                        <Typography.Text>
                          {searchResult.cross_references[children][0]}
                        </Typography.Text>
                      )
                    }
                    trigger="click"
                    overlayStyle={{ maxWidth: 400 }}
                  >
                    {children}
                  </Popover>
                ) : (
                  <span className={className}>{children}</span>
                );
              }}
              autoEscape={false}
              textToHighlight={phrase}
            />
            <Typography.Paragraph
              className="copyable-answer-phrase"
              copyable
              style={{
                display: 'inline-block',
                width: 22,
                height: 22,
                overflow: 'hidden',
                margin: 0,
                color: 'transparent',
                position: 'relative',
              }}
            >
              {phrase}
            </Typography.Paragraph>
          </p>
        )}
        {searchResult.table && (
          <table className="nlm-result-table">
            {cols.length > 0 && (
              <tr>
                {cols.map(value => {
                  return <th key={value}>{value}</th>;
                })}
              </tr>
            )}
            {rows.map((row, index) => {
              return (
                <tr key={index}>
                  {row.map((value, index) => {
                    return <td key={index}>{value}</td>;
                  })}
                </tr>
              );
            })}
          </table>
        )}
        {searchResult.block_text_terms &&
          searchResult.block_text_terms.length > 0 && (
            <div style={{ marginTop: '10px' }}>
              <Text type="secondary">Context Words: </Text>
              {searchResult.block_text_terms.map((value, index) => {
                return <Tag key={index}>{value}</Tag>;
              })}
            </div>
          )}
      </div>
    </>
  );
};

// Show the page number of the phrase quote from the search result
export const renderPageNumber = currentSearchResult => {
  const pageNum = currentSearchResult.page_idx + 1;
  if (!isNaN(pageNum)) {
    return (
      <span className="search-result-item--pg-num" style={{ marginRight: 5 }}>
        {'[pg. ' + pageNum + ']'}
      </span>
    );
  } else {
    return <></>;
  }
};

// Show the breadcrumb trail of Headers where the quote is taken from
export const renderBreadCrumbHeaders = searchResult => {
  if (searchResult.hierarchy_headers) {
    const length = searchResult.hierarchy_headers.length;
    const headerList =
      length > 3
        ? searchResult.hierarchy_headers.slice(length - 3)
        : searchResult.hierarchy_headers;
    const breadcrumbTrail = headerList.map((header, index) => {
      let headerElements = [];
      for (let word of header.split(' ')) {
        // Replace the last delimiter characters
        let search_word = word.replace(/[*.,';"_#]$/g, '');
        if (
          searchResult.header_text_terms &&
          searchResult.header_text_terms.includes(search_word)
        ) {
          const highlight = (
            <span
              className="keyword-hilite"
              style={{ fontSize: '12px' }}
              key={word}
            >
              {word + ' '}
            </span>
          );
          headerElements.push(highlight);
        } else if (
          searchResult.header_semantic_terms &&
          searchResult.header_semantic_terms.includes(search_word)
        ) {
          const highlight = (
            <span style={{ fontSize: '12px' }} key={word}>
              {word + ' '}
            </span>
          );
          headerElements.push(highlight);
        } else if (
          searchResult.hierarchy_headers_text_terms &&
          searchResult.hierarchy_headers_text_terms.includes(search_word)
        ) {
          const highlight = (
            <strong className="search-result-item--normal-text" key={word}>
              {word + ' '}
            </strong>
          );
          headerElements.push(highlight);
        } else {
          const normal = (
            <span className="search-result-item--normal-text" key={word}>
              {word + ' '}
            </span>
          );
          headerElements.push(normal);
        }
      }
      return <Breadcrumb.Item key={index}>{headerElements}</Breadcrumb.Item>;
    });

    return (
      <Breadcrumb separator=">" className="search-result-item--breadcrumb">
        {breadcrumbTrail}
      </Breadcrumb>
    );
  } else {
    return <></>;
  }
};

export const renderHeader = searchResult => {
  var headerHTML = searchResult.header_text
    ? searchResult.header_text.trim()
    : '';
  if (searchResult.header_text_terms) {
    for (const keyword of searchResult.header_text_terms) {
      const hilitedKeyword =
        "<span class='keyword-hilite-strong-h'>" + keyword + '</span>';
      headerHTML = headerHTML.replace(keyword, hilitedKeyword);
    }
  }
  if (searchResult.header_semantic_terms) {
    for (const keyword of searchResult.header_semantic_terms) {
      const hilitedKeyword =
        "<span class='keyword-hilite-subtle-h'>" + keyword + '</span>';
      headerHTML = headerHTML.replace(keyword, hilitedKeyword);
    }
  }
  return (
    <>
      {createElementsFromText(headerHTML, {
        whitelistedHtmlTags: ['mark', 'strong'],
        whitelistedHtmlAttributes: ['class', 'color'],
      })}
    </>
  );
};

export const hasHeaderHierarchy = searchResult => {
  return (
    searchResult.hierarchy_headers &&
    searchResult.hierarchy_headers.length > 0 &&
    searchResult.hierarchy_headers.join('').trim() !== ''
  );
};
export const renderHeaderHierarchy = searchResult => {
  let header_chain = [];
  let headerHTML = '';
  if (
    searchResult.hierarchy_headers &&
    searchResult.hierarchy_headers.length > 0
  ) {
    header_chain = searchResult.hierarchy_headers;
    headerHTML = header_chain.slice(-3, -1).join(' / ');
  }
  if (searchResult.hierarchy_headers_text_terms) {
    for (const keyword of searchResult.hierarchy_headers_text_terms) {
      const hilitedKeyword = "<strong'>" + keyword + '</strong>';
      headerHTML = headerHTML.replace(keyword, hilitedKeyword);
    }
  }
  return (
    <>
      {headerHTML !== '' &&
        createElementsFromText(headerHTML, {
          whitelistedHtmlTags: ['mark', 'strong'],
          whitelistedHtmlAttributes: ['class', 'color'],
        })}
    </>
  );
};
export const getEmptySearchCriteria = topn => {
  return {
    postProcessors: [],
    aggregateProcessors: [],
    topn: topn,
    docPerPage: topn,
    criterias: [
      {
        question: '',
        templates: [],
        headers: [],
        expectedAnswerType: 'auto',
        groupFlag: 'disable',
        tableFlag: 'disable',
        additionalQuestions: [],
        pageStart: -1,
        pageEnd: -1,
        beforeContextWindow: 0,
        afterContextWindow: 0,
        criteriaRank: -1,
        entityTypes: [],
      },
    ],
  };
};
export const clearWorkspaceSearchCriteria = workspaceContext => {
  workspaceContext.setWorkspaceSearchCriteria(
    getEmptySearchCriteria(20, workspaceContext.searchCriteriaDocPerPage)
  );
};
export const clearDocSearchCriteria = workspaceContext => {
  workspaceContext.setDocSearchCriteria(
    getEmptySearchCriteria(20, workspaceContext.searchCriteriaDocPerPage)
  );
};

export const clearRelationSearchCriteria = workspaceContext => {
  workspaceContext.setRelationSearchCriteria(
    getEmptySearchCriteria(20, workspaceContext.searchCriteriaDocPerPage)
  );
};

// KR: I don't think this is nuianced enough. Especially as we add roles that can do different things (ie. a viewer mostly reads, except
// that they can also save (or write) bookmarks).
// See useUserPermission for the updated function
export const checkWorkspaceAccess = (userInfo, workspace) => {
  let emailDomain = userInfo?.emailId.split('@')[1];
  let canRead =
    userInfo?.isAdmin ||
    workspace?.sharedWith == '*' ||
    '*' in workspace?.sharedWith ||
    (userInfo?.emailId in workspace?.collaborators &&
      workspace?.collaborators[userInfo?.emailId] === 'viewer') ||
    (emailDomain in workspace?.collaborators &&
      workspace?.collaborators[emailDomain] === 'viewer') ||
    userInfo?.emailId in workspace?.sharedWith ||
    emailDomain in workspace?.sharedWith ||
    userInfo?.id === workspace?.userId;
  let canWrite =
    userInfo?.isAdmin ||
    (userInfo?.emailId in workspace?.collaborators &&
      workspace?.collaborators[userInfo?.emailId] === 'editor') ||
    (emailDomain in workspace?.collaborators &&
      workspace?.collaborators[emailDomain] === 'editor') ||
    emailDomain in workspace?.sharedWith ||
    userInfo?.id === workspace?.userId;
  return { readAccess: canRead, writeAccess: canWrite };
};

export const checkFieldBundleAccess = ({
  userInfo,
  fieldBundleId,
  fieldSets,
  currentWorkspace,
}) => {
  let userId = userInfo?.id;
  let canWrite = false;
  if (userInfo?.isAdmin) {
    //if admin
    canWrite = true;
  } else {
    //owner of bundle
    for (var bundle of fieldSets) {
      if (bundle.id === fieldBundleId) {
        if (bundle.userId === userId) {
          canWrite = true;
          break;
        }
      }
    }
  }
  let workspaceAccess = checkWorkspaceAccess(userInfo, currentWorkspace);
  return {
    readAccess: workspaceAccess.readAccess,
    writeAccess: workspaceAccess.writeAccess || canWrite,
  };
};

// safely sets empty workspace search result
export const clearWorkspaceSearchResults = workspaceContext => {
  workspaceContext.setSearchResults({
    grid: [[], []],
    totalCount: 0,
    preProcessors: {},
    tmpFileFacts: [],
    fileFacts: [],
  });
};

// Updates the appropriate workspace context variables when switching workspaces
export const selectCurrentWorkspace = (workspaceContext, workspace) => {
  let key = workspace?.id;
  let name = workspace?.name;

  workspaceContext.setCurrentWorkspaceId(key);
  workspaceContext.setCurrentWorkspaceName(name);
  workspaceContext.setCurrentWorkspace(workspace);
  workspaceContext.setFileBrowserSelectedKeys([]);
  workspaceContext.setExtractionGridVisible(false);
  workspaceContext.setSelectedGraphNode([]);
  workspaceContext.setSearchResults({
    grid: [[], []],
    totalCount: 0,
    preProcessors: {},
    tmpFileFacts: [],
    fileFacts: [],
  });
  workspaceContext.setSearchResultsVisible(false);
  workspaceContext.setWorkspaceSearchMode(true);
  workspaceContext.setSelectedText('');
  workspaceContext.setCurrentDocument({
    id: 'all',
    html: { title: '' },
    pdfUrl: null,
    json: '',
    xml: undefined,
  });
  workspaceContext.setDisplayFormat(displayFormats.PDF);
  clearWorkspaceSearchCriteria(workspaceContext);
  workspaceContext.setWorkspaceSearchVisible(true);
  workspaceContext.setLoadingDocuments(true);
};

export const getAnswerTypesFromCriteria = (
  criterias,
  fieldName = 'expected_answer_type'
) => {
  let labels = [];
  if (criterias && criterias.length > 0) {
    for (let criteria of criterias) {
      if (fieldName in criteria) {
        let expected_answer_type = criteria.is_bool_question
          ? 'bool'
          : criteria[fieldName];
        if (expected_answer_type in answerTypeDescriptions) {
          let answerType = answerTypeDescriptions[expected_answer_type];
          if (!(answerType in labels)) {
            labels.push(answerType);
          }
        } else {
          labels.push(expected_answer_type);
        }
      }
    }
  }
  return labels;
};

export const getEntityLabelConfig = workspaceContext => {
  let domain = workspaceContext.currentWorkspace?.settings
    ? workspaceContext.currentWorkspace?.settings.domain
    : 'general';
  if (domain === 'biology') {
    return BIO_ENTITY_LABEL_CONFIG;
  } else {
    return GENERAL_ENTITY_LABEL_CONFIG;
  }
};

export const getUniqueEntityConfigByLabel = entityLabelConfig => [
  ...new Map(
    Object.keys(entityLabelConfig).map(key => [
      entityLabelConfig[key].color,
      {
        label: entityLabelConfig[key].label,
        color: entityLabelConfig[key].color,
        defaultHilight: entityLabelConfig[key].defaultHilight,
        key,
      },
    ])
  ).values(),
];

export const getDistinctEntityLabelConfig = workspaceContext => {
  let byColorMap = {};
  let configs = Object.values(getEntityLabelConfig(workspaceContext));
  for (let config of configs) {
    byColorMap[config.color] = config;
  }
  return Object.values(byColorMap);
};

export const getEntitySelectionValues = workspaceContext => {
  let byLabelMap = {};
  let configEntries = Object.entries(getEntityLabelConfig(workspaceContext));
  for (let entry of configEntries) {
    if (entry[0] !== 'unknown') {
      if (Object.prototype.hasOwnProperty.call(byLabelMap, entry[1].label)) {
        byLabelMap[entry[1].label].push(entry[0]);
      } else {
        byLabelMap[entry[1].label] = [entry[0]];
      }
    }
  }
  return byLabelMap;
};

export const customAnswerPicker = customFormatterOptions => {
  return 'AnswerPicker(["' + customFormatterOptions.join('","') + '"])';
};

export const createEntityExtractor = (entityNames, entityPhrase) => {
  if (!entityPhrase) entityPhrase = '$ENTITY will';
  return (
    'EntityExtractionProcessor(["' +
    entityNames.join('","') +
    '"], question="' +
    entityPhrase +
    '")'
  );
};

export const invertEntityList = (types, entity2type) => {
  let type2entity = {};
  for (let entityType of types) {
    type2entity[entityType] = new Set();
  }
  for (let item of entity2type) {
    let entityTypes = item[1];
    let entity = item[0];
    for (let entityType of entityTypes) {
      if (Object.prototype.hasOwnProperty.call(type2entity, entityType)) {
        type2entity[entityType].add(entity);
      }
    }
  }
  return type2entity;
};

export const createAdHocSearch = (
  workspaceContext,
  fieldsData,
  customFormatterOptions,
  parentBundleId
) => {
  // nosonar
  let customFormat = '';
  if (customFormatterOptions && customFormatterOptions.length > 0) {
    customFormat = customAnswerPicker(customFormatterOptions);
  }
  let postProcessors = [];
  console.log('fieldsData..', fieldsData, fieldsData.entityNames);
  if (fieldsData.entityNames && fieldsData.entityNames.length > 0) {
    postProcessors.push(
      createEntityExtractor(fieldsData.entityNames, fieldsData.entityPhrase)
    );
  } else if (fieldsData.format) {
    postProcessors.push(fieldsData.format);
  }
  if (customFormat) {
    postProcessors.push(customFormat);
  }

  let adHocSearch = {
    parentBundleId: parentBundleId,
    postProcessors: postProcessors,
    aggregatePostProcessors: [],
    topn: 20,
    docPerPage: workspaceContext.searchCriteriaDocPerPage,
    offset: 0,
    groupByFile: true,
    criterias: [],
  };
  for (let criteria of fieldsData.multiCriteria) {
    let templates = '';
    if (Array.isArray(criteria.templates)) {
      templates = criteria.templates;
    } else if (criteria.templates === undefined) {
      templates = [];
    } else {
      templates = [criteria.templates];
    }
    let entityTypes = [];
    if (criteria.sourceEntityType) {
      entityTypes.push(criteria.sourceEntityType);
    }
    if (criteria.targetEntityType) {
      entityTypes.push(criteria.targetEntityType);
    }
    if (criteria.entityTypes && criteria.entityTypes.length > 0) {
      for (let entityType of criteria.entityTypes) {
        entityTypes.push(entityType);
      }
    }
    let additionalQuestions = [];
    if (criteria.sourceQuestion && criteria.sourceQuestion.trim() !== '') {
      additionalQuestions.push(criteria.sourceQuestion);
    }
    if (criteria.targetQuestion && criteria.targetQuestion.trim() !== '') {
      additionalQuestions.push(criteria.targetQuestion);
    }

    let adHocCriteria = {
      criteriaRank: 1,
      templates: templates,
      question: criteria.question,
      headers: criteria.headers === undefined ? [] : criteria.headers,
      expectedAnswerType: fieldsData.expectedAnswerType,
      entityTypes: entityTypes,
      additionalQuestions: additionalQuestions,
      groupFlag: criteria.enableGrouping ? 'enable' : 'disable',
      tableFlag: criteria.enableTableSearch ? 'enable' : 'disable',
      pageStart: criteria.pageStart === null ? -1 : criteria.pageStart,
      pageEnd: criteria.pageEnd === null ? -1 : criteria.pageEnd,
      beforeContextWindow: criteria.beforeContextWindow,
      afterContextWindow: criteria.afterContextWindow,
    };
    adHocSearch.criterias.push(adHocCriteria);
  }
  return adHocSearch;
};
export const isPubmedFile = title =>
  title?.startsWith('Medline Citation') || title?.startsWith('Pubmed Article');

export const isPublicWorkspace = workspace => {
  return Object.keys(workspace.collaborators).some(email => email === '*');
};

export const getAnswerPickerValues = postProcessor => {
  return JSON.parse(
    postProcessor.slice('AnswerPicker(['.length - 1, postProcessor.length - 1)
  );
};

export const handleDocumentUploadError = error => {
  if (
    error?.response?.data?.status === 403 &&
    error?.response?.data.detail?.startsWith('Subscription limit reached')
  ) {
    if (process.env.REACT_APP_APP_NAME === 'CHATTY_PDF') {
      message.warning(<FreeTrialExpiryNotification />, 0);
    }
  } else {
    showError(error);
  }
};

export const isSearchApplied = searchCriteria => {
  const criterion = searchCriteria?.criterias && searchCriteria?.criterias[0];
  return (
    !!criterion?.question ||
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
