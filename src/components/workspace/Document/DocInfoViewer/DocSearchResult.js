import { memo, useContext, useEffect, useState } from 'react';
import AppContext from '../../../../contexts/app/AppContext';
import { getAnswerTypesFromCriteria } from '../../../../utils/helpers';
import SearchResult from '../../../SearchResult';
import { WorkspaceContext } from '../../../WorkspaceContext';
export default memo(function DocSearchResult({
  docId,
  workspaceId,
  searchLoading,
  tableHeight,
}) {
  const [answerTypes, setAnswerTypes] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchResultsEmpty, setSearchResultsEmpty] = useState(false);
  const workspaceContext = useContext(WorkspaceContext);
  const { isChattyPdf, isEDGAR } = useContext(AppContext);

  useEffect(() => {
    if (workspaceContext.docSearchResults.results?.[0]?.fileIdx === docId) {
      if (
        workspaceContext.docSearchResults.results[0].criterias.length > 0 &&
        workspaceContext.docSearchResults.results[0].criterias[0].is_question
      ) {
        setAnswerTypes(
          getAnswerTypesFromCriteria(
            workspaceContext.docSearchResults.results[0].criterias
          )
        );
      } else {
        setAnswerTypes([]);
      }
      if (
        workspaceContext.docSearchResults.results &&
        workspaceContext.docSearchResults.results.length > 0
      ) {
        if (
          workspaceContext.docSearchResults.results[0].topicFacts[0]
            ?.block_type === 'summary'
        ) {
          setSearchResults(
            workspaceContext.docSearchResults.results[0].topicFacts?.slice(1)
          );
        } else {
          setSearchResults(
            workspaceContext.docSearchResults.results[0].topicFacts
          );
        }
      }
    } else {
      setAnswerTypes([]);
      setSearchResults([]);
    }
    setSearchResultsEmpty(workspaceContext.docSearchResults.empty);
  }, [workspaceContext.docSearchResults]);

  return (
    <>
      <SearchResult
        className="doc-info-viewer--search-results"
        detailVisible={false}
        tableHeight={tableHeight}
        searchLoading={searchLoading}
        selectedSearchCriteria={workspaceContext.docSearchCriteria}
        showCreateFieldButton={true}
        showCriteria={false}
        docId={docId}
        answerTypes={answerTypes}
        empty={searchResultsEmpty}
        searchResults={searchResults}
        workspaceId={workspaceId}
        showCriteriaActions={isChattyPdf() || isEDGAR() ? false : true}
      ></SearchResult>
    </>
  );
});
