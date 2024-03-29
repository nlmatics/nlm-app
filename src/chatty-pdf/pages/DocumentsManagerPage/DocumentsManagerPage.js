import { Col, Layout, Row } from 'antd';
import { useContext, useEffect } from 'react';
import { Redirect, useParams } from 'react-router-dom';
import ChattyPDFFavicon from '../../../assets/images/ChattyPDF-favicon.svg';
import { WorkspaceContext } from '../../../components/WorkspaceContext';
import DocumentList from '../../../components/workspace/documents/DocumentList';
import useWorkspaceDocumentsIngestionStatus from '../../../components/workspace/useWorkspaceDocumentsIngestionStatus';
import useUserPermission from '../../../hooks/useUserPermission';
import AppHeader from '../../components/AppHeader/AppHeader';

export default function DocumentsManagerPage() {
  useUserPermission();
  const { workspaceId } = useParams();
  const workspaceContext = useContext(WorkspaceContext);
  const { workspaceDocumentsIngestionStatus } =
    useWorkspaceDocumentsIngestionStatus(
      workspaceId,
      workspaceContext.documents
    );

  useEffect(() => {
    document.title = 'ChattyPDF';
    let link = document.querySelector("link[rel~='icon']");
    link.href = ChattyPDFFavicon;
  }, []);

  if (!workspaceContext.currentWorkspace) {
    return <Redirect to={`/documents`} />;
  }

  return (
    <Layout.Content style={{ padding: 20 }}>
      <AppHeader />
      <Row justify="center">
        <Col xs={{ span: 24 }} lg={{ span: 20 }}>
          <DocumentList
            workspaceId={workspaceId}
            workspaceDocumentsIngestionStatus={
              workspaceDocumentsIngestionStatus
            }
          ></DocumentList>
        </Col>
      </Row>
    </Layout.Content>
  );
}
