import { List } from 'antd';
import { useContext } from 'react';
import usePageHelper from '../../../pages/hooks/usePageHelper';
import { goToFileSearch } from '../../../utils/helpers';
import { useAuth } from '../../../utils/use-auth';
import SearchResult from '../../SearchResult';
import { WorkspaceContext } from '../../WorkspaceContext';

export default function SearchResultFileItem({
  file,
  answerTypes,
  showOnlyTopAnswer,
}) {
  const { isSearchPage, isWorkspaceSearchPage } = usePageHelper();
  const { user } = useAuth();
  const workspaceContext = useContext(WorkspaceContext);

  const getSearchResults = () => {
    if (showOnlyTopAnswer) {
      return file.topicFacts.slice(0, 1);
    } else {
      return file.topicFacts.slice(0, 3);
    }
  };
  return (
    <List.Item className="workspace-search-result-item--list">
      <List.Item.Meta
        description={
          <div>
            <SearchResult
              fileName={file.fileName}
              fileMeta={file.fileMeta}
              detailVisible={false}
              searchResults={getSearchResults()}
              docId={file.fileIdx}
              disableSpinner={true}
              selectedSearchCriteria={workspaceContext.workspaceSearchCriteria}
              showCriteriaActions={false}
              showCriteria={false}
              answerTypes={answerTypes}
              showQuestionTip={false}
              resultHandler={
                isSearchPage || isWorkspaceSearchPage
                  ? null
                  : result => {
                      goToFileSearch(user, workspaceContext, file);
                      workspaceContext.setWorkspaceSearchSelectedResult(result);
                    }
              }
              showOnlyTopAnswer={showOnlyTopAnswer}
            ></SearchResult>
          </div>
        }
      />
    </List.Item>
  );
}
