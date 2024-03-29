import { MoreOutlined } from '@ant-design/icons';
import { Drawer, Spin, Table, Tooltip } from 'antd';
import { useContext, useEffect, useRef, useState, lazy, Suspense } from 'react';
import { dataTypesFormatters } from '../utils/constants.js';
import {
  getAnswerTypesFromCriteria,
  getDataTypeFromAnswerType,
  goToFileSearch,
} from '../utils/helpers.js';
import { defaultFormatter } from '../utils/valueFormatters.js';
import SearchResult from './SearchResult.js';
import { WorkspaceContext } from './WorkspaceContext.js';
const SearchResultItem = lazy(() => import('./SearchResultItem'));

export default function SearchExtractionView({ answerTypes, searchCriteria }) {
  // nosonar
  const workspaceContext = useContext(WorkspaceContext);
  const [expandedFileFact, setExpandedFileFact] = useState({
    fileName: '',
    fileIdx: '',
    topicFacts: [],
  });
  const [searchExpansionVisible, setSearchExpansionVisible] = useState(false);
  const tableRef = useRef();
  const drawerRef = useRef();

  const resetTableScrollPosition = () => {
    if (
      tableRef.current &&
      tableRef.current.getElementsByClassName('ant-table-body') &&
      tableRef.current.getElementsByClassName('ant-table-body').length > 0
    ) {
      console.log(
        'resetting scroll position',
        tableRef.current.getElementsByClassName('ant-table-body')[0].scrollTop,
        tableRef.current
      );
      tableRef.current
        .getElementsByClassName('ant-table-body')[0]
        .scrollTo(0, 0);
    }
  };

  useEffect(() => {
    resetTableScrollPosition();
  }, [workspaceContext.searchResults.fileFacts]);

  useEffect(() => {
    if (drawerRef.current && searchExpansionVisible) {
      console.log('scrolling drawer to 0');
      drawerRef.current.parentNode.scrollTo(0, 0);
    }
  }, [expandedFileFact, searchExpansionVisible]);
  const reformatAnswer = fileFact => {
    let formatter = defaultFormatter;
    let searchResult = fileFact.topicFacts[0];
    let formattedAnswer = formatter(searchResult);
    if (fileFact.criterias && fileFact.criterias.length > 0) {
      let answerType = fileFact.criterias[0].expected_answer_type;
      let dataType = getDataTypeFromAnswerType(answerType);
      if (dataType) {
        formatter = dataTypesFormatters[dataType];
      }
      if (!formatter) {
        formatter = defaultFormatter;
      }
      if (fileFact.criterias[0].group_flag !== 'enable') {
        formattedAnswer = formatter(searchResult);
        if (!formattedAnswer) formattedAnswer = '-';
      } else {
        let matches = searchResult?.matches;
        if (!matches) {
          matches = [searchResult];
        }
        const dataItems = matches?.map(match => formatter(match));
        if (dataItems && dataItems.join('') !== '') {
          let listItems = dataItems?.map((dataItem, index) => {
            if (dataItem !== '') {
              return <li key={index}>{dataItem}</li>;
            }
          });
          formattedAnswer = (
            <ul className={'nlm-extract-list-answer-formatted'}>{listItems}</ul>
          );
        } else {
          formattedAnswer = <div>-</div>;
        }
      }
    }
    return formattedAnswer;
  };
  const onRowMore = item => {
    setExpandedFileFact(item);
    setSearchExpansionVisible(true);
  };

  const columns = [
    {
      title: 'Extracted Data Field',
      className: 'nlm-search-extraction-view-answer-column',
      render: item => (
        <div className="nlm-search-extraciton-view-cell">
          {reformatAnswer(item)}
        </div>
      ),
      width: '30%',
    },
    {
      title: 'Context',
      width: 700,
      render: item => (
        <Suspense fallback={<Spin />}>
          <SearchResultItem
            docId={item.fileIdx}
            answerLabel={null}
            answerTypes={getAnswerTypesFromCriteria(item?.criterias)}
            showResult={result => {
              goToFileSearch(null, workspaceContext, item);
              workspaceContext.setWorkspaceSearchSelectedResult(result);
            }}
            searchResult={item.topicFacts[0]}
            openFileLinkLabel={item.fileName}
            docActiveTabKey="search"
            selectedSearchCriteria={searchCriteria}
          ></SearchResultItem>
        </Suspense>
      ),
    },
    {
      title: '',
      width: 25,
      fixed: true,
      render: item => (
        <Tooltip title={'View other answers'}>
          <MoreOutlined
            onClick={() => onRowMore(item)}
            style={{ marginLeft: -5 }}
          ></MoreOutlined>
        </Tooltip>
      ),
    },
  ];

  return (
    <>
      <Table
        className="nlm-searchExtractionView"
        ref={tableRef}
        bordered={false}
        columns={columns}
        pagination={false}
        dataSource={workspaceContext.searchResults.fileFacts}
        scroll={{ y: 'calc(100vh - 262px)' }}
      />
      <Drawer
        className="nlm-drawer"
        width={'25vw'}
        placement={'right'}
        title={'Other answers from ' + expandedFileFact.fileName}
        open={searchExpansionVisible}
        ref={drawerRef}
        onClose={() => setSearchExpansionVisible(false)}
      >
        <div ref={drawerRef}>
          <SearchResult
            detailVisible={false}
            searchResults={expandedFileFact.topicFacts}
            docId={expandedFileFact.fileIdx}
            selectedSearchCriteria={workspaceContext.workspaceSearchCriteria}
            showCreateFieldButton={false}
            showCriteria={false}
            showQuestionTip={false}
            answerTypes={answerTypes}
            resultHandler={result => {
              setSearchExpansionVisible(false);
              goToFileSearch(null, workspaceContext, expandedFileFact);
              workspaceContext.setWorkspaceSearchSelectedResult(result);
            }}
            from="search"
          ></SearchResult>
        </div>
      </Drawer>
    </>
  );
}
