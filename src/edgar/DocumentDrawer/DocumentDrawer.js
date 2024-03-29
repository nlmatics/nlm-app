import { CloseOutlined } from '@ant-design/icons';
import { Card, Col, Drawer, PageHeader, Row } from 'antd';
import PdfViewer from '../../components/PdfViewer/PdfViewer';
import { useEntityLabelConfig } from '../../hooks/useEntityLabelConfig';
import useDocumentDetails from '../hooks/useDocumentDetails';
import DocumentMenu from './DocumentMenu';
import './index.less';

export default function DocumentDrawer({
  onClose,
  documentId,
  workspaceId,
  documentTitle,
}) {
  const { data: documentDetails } = useDocumentDetails(documentId);
  const { entityLabelConfig } = useEntityLabelConfig(workspaceId);

  return (
    <Drawer
      open={true}
      closable={false}
      width="100vw"
      height="calc(100vh - 70px)"
      destroyOnClose
      bodyStyle={{ padding: 0 }}
      style={{ marginTop: 50 }}
      mask={false}
    >
      <PageHeader
        className="edgar-document-page"
        onBack={onClose}
        backIcon={<CloseOutlined />}
        style={{ padding: '5px 20px', height: 'calc(100vh - 50px)' }}
        title={documentTitle}
      >
        <Row gutter={[10, 10]}>
          <Col span={7}>
            <DocumentMenu
              workspaceId={workspaceId}
              documentId={documentId}
              documentTitle={documentTitle}
            />
          </Col>
          <Col span={17}>
            <Card bodyStyle={{ padding: 0 }}>
              <PdfViewer
                workspaceId={workspaceId}
                entityLabelConfig={entityLabelConfig}
                documentId={documentId}
                currentDocument={documentDetails}
                documentHeight="calc(100vh - 120px)"
                implicitOutline={true}
                isEdgar
              />
            </Card>
          </Col>
        </Row>
      </PageHeader>
    </Drawer>
  );
}
