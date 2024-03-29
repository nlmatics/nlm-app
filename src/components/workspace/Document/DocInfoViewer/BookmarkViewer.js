import { useContext, useState, useEffect, Suspense, lazy } from 'react';
import { WorkspaceContext } from '../../../WorkspaceContext.js';
import { makeStyles } from '@material-ui/styles';
import { showResultInDocument } from '../../../../utils/helpers';

import {
  getSavedSearchesByAction,
  deleteSavedSearchResult,
} from '../../../../utils/apiCalls.js';
const SearchResultItem = lazy(() => import('../../../SearchResultItem'));
import { Card, List, Spin } from 'antd';

const useStyles = makeStyles({
  searchResultsList: {
    overflowY: 'hidden',
    paddingRight: '15px',
    paddingLeft: '0px',
    '&:hover': {
      overflowY: 'overlay',
    },
  },
});

// To be renamed to PinsViewer
export default function BookMarkViewer({ documentId }) {
  const [prevResult, setPrevResult] = useState(null);
  const classes = useStyles();
  const workspaceContext = useContext(WorkspaceContext);
  const [loading, setLoading] = useState(false);
  const [pins, setPins] = useState([]);
  // eslint-disable-next-line
  const [height, setHeight] = useState('calc(100vh - 100px)');

  const showResult = result => {
    showResultInDocument(
      workspaceContext,
      prevResult,
      result,
      'match_idx',
      'phrase'
    );
    setPrevResult(result);
  };

  const deletePin = searchResult => {
    deleteSavedSearchResult(
      workspaceContext,
      documentId,
      searchResult.uniq_id,
      setLoading,
      () => {
        let newPins = pins.filter(
          bookmark => bookmark.searchResult.uniq_id !== searchResult.uniq_id
        );
        setPins(newPins);
      }
    );
  };

  useEffect(() => {
    const getPins = () => {
      getSavedSearchesByAction(documentId, 'bookmark', setLoading, setPins);
    };
    if (documentId) {
      getPins();
    }
  }, [documentId]);

  return (
    <Card bodyStyle={{ padding: 10 }}>
      <Spin tip="Loading saved pins.." spinning={loading}>
        <List
          itemLayout="horizontal"
          locale={{ emptyText: 'No saved pins found' }}
          style={{ height: `${height}`, overflowX: 'hidden' }}
          className={`${classes.searchResultsList} search-results-list`}
          dataSource={pins}
          rowKey={bookmark => {
            return bookmark.unique_id;
          }}
          renderItem={pin => (
            <Suspense fallback={<Spin />}>
              <SearchResultItem
                searchResult={pin.searchResult}
                docId={documentId}
                searchList={true}
                answerLabel={pin.userName}
                showResult={showResult}
                removeAnswer={deletePin}
                itemIndex={pins.indexOf(pin)}
              ></SearchResultItem>
            </Suspense>
          )}
        />
      </Spin>
    </Card>
  );
}
