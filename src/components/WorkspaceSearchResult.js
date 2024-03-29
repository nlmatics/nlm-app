import { List } from 'antd';
import { useContext, useEffect, useRef, useState } from 'react';

import { makeStyles } from '@material-ui/styles';
import SearchResultFileItem from './common/SearchResultFileItem';
import { WorkspaceContext } from './WorkspaceContext';
import usePageHelper from '../pages/hooks/usePageHelper';

function WorkspaceSearchResult({
  answerTypes,
  workspaceId,
  showOnlyTopAnswer,
  height,
}) {
  const useStyles = makeStyles({
    workspaceSearchList: {},
    headerElements: { paddingLeft: '5px', paddingRight: '5px', width: '100%' },
    searchWrapper: {
      margin: '0 auto',
      width: '100%',
    },
    totalResultCount: {
      paddingLeft: '50px',
      paddingRight: '50px',
      width: '100%',
    },
    patternDisplay: {
      width: '100%',
    },
    triggerButton: {},
    innerSearchResultList: {
      display: 'flex',
      flexDirection: 'column',
      paddingLeft: '10px',
      paddingTop: '0px',
      alignItems: 'start',
    },
    rightGlobalSearchPanel: {},
    browseSearchList: () => ({
      minWidth: '480px',
      maxWidth: '1080px',
      marginTop: '10px',
      margin: 'auto',
      overflowX: 'hidden',
      paddingRight: '0px',
      width: '100%',
      height: height || 'calc(100vh - 295px)',
    }),
  });
  const workspaceContext = useContext(WorkspaceContext);
  const [openCollapse] = useState(false);
  const classes = useStyles({ openCollapse });
  const { isSearchPage } = usePageHelper();

  const searchResultsNode = useRef();

  useEffect(() => {
    if (searchResultsNode.current) {
      searchResultsNode.current.scrollTo(0, 0);
    }
  }, [workspaceContext.searchResults.fileFacts]);

  return (
    <div
      style={isSearchPage ? { height: 'auto' } : {}}
      className={`${classes.browseSearchList} nlm-workspace-search-result nlm-workspaceSearchResult`}
      ref={searchResultsNode}
    >
      <List
        className={classes.workspaceSearchList}
        dataSource={
          workspaceContext.prevWorkspaceSearchCriteria.question ||
          workspaceContext.workspaceSearchCriteria.question ||
          (workspaceContext.workspaceSearchCriteria.criterias &&
            workspaceContext.workspaceSearchCriteria.criterias.length) ||
          (workspaceContext.workspaceSearchCriteria.patterns &&
            workspaceContext.workspaceSearchCriteria.patterns.length) ||
          workspaceContext.workspaceSearchCriteria.sectionHeading ||
          workspaceContext.selectedText
            ? workspaceContext.searchResults.fileFacts
            : []
        }
        style={{
          width: '100%',
        }}
        renderItem={file => (
          <SearchResultFileItem
            file={file}
            workspaceId={workspaceId}
            answerTypes={answerTypes}
            showOnlyTopAnswer={showOnlyTopAnswer}
          />
        )}
      />
    </div>
  );
}
export default WorkspaceSearchResult;
