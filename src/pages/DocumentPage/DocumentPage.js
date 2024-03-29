import { useHistory, useParams } from 'react-router-dom';
import Document from '../../components/workspace/Document/Document';
import DocumentConfigProvider from '../../components/workspace/Document/DocumentConfigProvider';
import usePageHelper from '../hooks/usePageHelper';

export default function DocumentPage() {
  const { documentId, docActiveTabKey, workspaceId } = useParams();
  const { isSearchPage } = usePageHelper();
  const history = useHistory();
  return (
    <div style={{ padding: 10 }}>
      <DocumentConfigProvider>
        <Document
          documentId={documentId}
          docActiveTabKey={docActiveTabKey}
          onBack={() => {
            history.push(
              isSearchPage
                ? `/search/${workspaceId}`
                : `/workspace/${workspaceId}/documents`
            );
          }}
        />
      </DocumentConfigProvider>
    </div>
  );
}
