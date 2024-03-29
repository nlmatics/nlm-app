import { Drawer, Layout } from 'antd';
import { useContext, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Document from '../../components/workspace/Document/Document';
import DocumentConfigProvider from '../../components/workspace/Document/DocumentConfigProvider';
import { WorkspaceContext } from '../../components/WorkspaceContext';
import usePageHelper from '../../pages/hooks/usePageHelper';
import { clearDocSearchCriteria } from '../../utils/helpers';
import AppContext from '../app/AppContext';
import ThemeContext from '../theme/ThemContext';
import DocumentContext from './DocumentContext';
import DocumentDrawer from '../../edgar/DocumentDrawer';

function usePrevious(value) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  // Return previous value (happens before update in useEffect above)
  return ref.current;
}

export default function DocumentProvider({ children, isEdgar }) {
  const { workspaceId } = useParams();
  const [documentId, setDocumentId] = useState(null);
  const [fieldName, setFieldName] = useState('');
  const [viewId, setViewId] = useState(null);
  const [documentTitle, setDocumentTitle] = useState();
  const [docActiveTabKey, setDocActiveTabKey] = useState(null);
  const [showAlternateAnswers, setShowAlternateAnswers] = useState(false);
  const [fieldBundleId, setFieldBundleId] = useState();
  const [documentIds, setDocumentIds] = useState([]);
  const onDeleteRef = useRef();
  const { isSearchPage } = usePageHelper();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { theme } = useContext(ThemeContext);
  const workspaceContext = useContext(WorkspaceContext);
  const prevWorkspaceId = usePrevious(workspaceId);
  const { isChattyPdf } = useContext(AppContext);
  useEffect(() => {
    // pdfjs currently doesn't support switching of theme. For pdf viewer to pick a new theme
    // it has to reinitialize. Hence closing the Doc drawer on theme change.
    // Also destroyOnClose is set on drawer so that it is reinitialized.
    setIsDrawerOpen(false);
  }, [theme]);

  useEffect(() => {
    if (prevWorkspaceId && workspaceId !== prevWorkspaceId) {
      // Close the Doc drawer when user switches to a different workspace
      // while drawer is open.
      closeDocument();
    }
  }, [prevWorkspaceId, workspaceId]);

  const showDocument = ({
    documentId,
    docActiveTabKey,
    fieldName = '',
    showAlternateAnswers,
    fieldBundleId,
    documentIds,
    onDelete,
    documentTitle,
    viewId,
  }) => {
    setIsDrawerOpen(true);
    setDocumentId(documentId);
    setDocActiveTabKey(docActiveTabKey);
    setFieldName(fieldName);
    setShowAlternateAnswers(showAlternateAnswers);
    setFieldBundleId(fieldBundleId);
    setDocumentIds(documentIds);
    setDocumentTitle(documentTitle);
    setViewId(viewId);
    onDeleteRef.current = onDelete;
  };

  const closeDocument = () => {
    setIsDrawerOpen(false);
    workspaceContext.setSearchPDF(null);
    clearDocSearchCriteria(workspaceContext);
    workspaceContext.setDocSearchResults({
      empty: false,
      results: [],
    });
  };

  return (
    <DocumentContext.Provider
      value={{
        showDocument,
        isDrawerOpen,
        closeDocument,
      }}
    >
      {isEdgar ? (
        isDrawerOpen && (
          <DocumentDrawer
            onClose={closeDocument}
            documentId={documentId}
            workspaceId={workspaceId}
            documentTitle={documentTitle}
          />
        )
      ) : (
        <div key={`${documentId}${fieldName}`}>
          <Drawer
            open={isDrawerOpen}
            closable={false}
            width={
              isSearchPage || isChattyPdf() ? '100vw' : 'calc(100vw - 50px)'
            }
            bodyStyle={{ padding: 0 }}
            mask={false}
            onClose={closeDocument}
            destroyOnClose
          >
            <Layout style={{ padding: 17 }}>
              <DocumentConfigProvider>
                <Document
                  documentId={documentId}
                  docActiveTabKey={docActiveTabKey}
                  onBack={closeDocument}
                  fieldName={fieldName}
                  showAlternateAnswers={showAlternateAnswers}
                  fieldBundleId={fieldBundleId}
                  documentIds={documentIds}
                  onDelete={onDeleteRef.current}
                  viewId={viewId}
                />
              </DocumentConfigProvider>
            </Layout>
          </Drawer>
        </div>
      )}
      {children}
    </DocumentContext.Provider>
  );
}
