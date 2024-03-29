import { Result, Spin, Table } from 'antd';
import { useContext, useEffect, useRef, useState, lazy, Suspense } from 'react';
import { goToFileSearch } from '../utils/helpers.js';
import RelationRenderer from './RelationRenderer.js';
import { WorkspaceContext } from './WorkspaceContext.js';
const SearchResultItem = lazy(() => import('./SearchResultItem'));

export default function RelationExtractionView({ searchResults, setLoading }) {
  // nosonar
  const workspaceContext = useContext(WorkspaceContext);
  // eslint-disable-next-line
  const [scrollPosition, setScrollPosition] = useState('calc(100vh - 280px)');
  const tableRef = useRef();

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
  }, [searchResults]);

  const renderExtractedAnswer = item => {
    return (
      <>
        {item.relation_head || item.relation_tail ? (
          <RelationRenderer
            headTitle={item.relation_head ? item.relation_head : '-'}
            tailTitle={item.relation_tail ? item.relation_tail : '-'}
            relationTitle={
              workspaceContext.relationSearchCriteria.criterias[0].question
            }
          ></RelationRenderer>
        ) : (
          <div className="nlm-search-extraciton-view-cell">
            {item.formatted_answer}
          </div>
        )}
      </>
    );
  };

  const columns = [
    {
      title: 'Extracted Entities',
      className: 'nlm-search-extraction-view-answer-column',
      render: item => (
        <div className="nlm-search-extraciton-view-cell">
          {renderExtractedAnswer(item)}
        </div>
      ),
      width: '30%',
    },
    {
      title: 'Context',
      render: item => (
        <Suspense fallback={<Spin />}>
          <SearchResultItem
            docId={item.file_idx}
            hideAnswer={true}
            answerLabel={null}
            showResult={() => {
              setLoading(true);
              goToFileSearch(null, workspaceContext, item, 'relation');
              setLoading(false);
            }}
            searchResult={item}
            selectedSearchCriteria={workspaceContext.relationSearchCriteria}
            hiliteEntityTypes={
              workspaceContext.relationSearchCriteria.criterias[0].entityTypes
            }
            openFileLinkLabel={item.file_name}
            docActiveTabKey="search"
          ></SearchResultItem>
        </Suspense>
      ),
      width: '60%',
    },
  ];

  return (
    <>
      {searchResults.empty ? (
        <Result
          type="error"
          subTitle={'Please refine your criteria'}
          title="No relations found"
        ></Result>
      ) : searchResults.fileFacts.length == 0 ? (
        <Result
          subTitle={'Relations will appear here upon searching'}
          title="Enter Criteria"
        ></Result>
      ) : (
        <Table
          ref={tableRef}
          bordered={false}
          columns={columns}
          pagination={false}
          dataSource={
            searchResults.fileFacts.length > 0
              ? searchResults.fileFacts[0].topicFacts
              : []
          }
          scroll={{ y: scrollPosition, scrollToFirstRowOnChange: true }}
        />
      )}
    </>
  );
}
