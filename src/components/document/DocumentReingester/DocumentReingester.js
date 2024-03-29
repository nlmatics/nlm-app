import {
  InteractionOutlined,
  MailOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { Button, Modal, Result, Tooltip } from 'antd';
import { useState } from 'react';
import { reIngestDocument } from '../../../utils/apiCalls';

export default function DocumentReingester({
  currentWorkspaceEditable,
  documentId,
  currentDocument,
  updateDocumentIngestionStatus,
  isDocumentIngestionInProgress,
}) {
  const [isReingestDocumentModalVisible, setIsReingestDocumentModalVisible] =
    useState(false);

  const showModal = () => {
    setIsReingestDocumentModalVisible(true);
  };

  const handleOk = async () => {
    setIsReingestDocumentModalVisible(false);
    await reIngestDocument(documentId);
    updateDocumentIngestionStatus();
  };

  const handleOkWithOCR = async () => {
    setIsReingestDocumentModalVisible(false);
    await reIngestDocument(documentId, true);
    updateDocumentIngestionStatus();
  };

  const handleCancel = () => {
    setIsReingestDocumentModalVisible(false);
  };
  const isReingestDisabled = () => {
    return (
      !currentWorkspaceEditable ||
      documentId === '' ||
      isDocumentIngestionInProgress
    );
  };
  return (
    <>
      <Modal
        title="Reingest Document"
        open={isReingestDocumentModalVisible}
        onCancel={handleCancel}
        destroyOnClose
        footer={
          <>
            <Button onClick={handleCancel}>Cancel</Button>
            <Button onClick={handleOk} type="primary">
              Yes, Reingest
            </Button>
            <Button onClick={handleOkWithOCR} type="primary">
              Yes, Reingest with OCR
            </Button>
          </>
        }
      >
        <Result
          status="warning"
          title="Reingest document?"
          subTitle="If you are not sure, please contact support for help."
          extra={
            <Button
              type="link"
              href="mailto:support@nlmatics.com"
              icon={<MailOutlined />}
              onClick={handleCancel}
            >
              Contact Support
            </Button>
          }
        />
      </Modal>
      <Tooltip
        title={
          isDocumentIngestionInProgress
            ? `Reingesting ${currentDocument?.name}`
            : `Reingest ${currentDocument?.name}`
        }
        placement="right"
      >
        <Button
          type="link"
          disabled={isReingestDisabled()}
          icon={
            isDocumentIngestionInProgress ? (
              <SyncOutlined spin />
            ) : (
              <InteractionOutlined />
            )
          }
          onClick={showModal}
        ></Button>
      </Tooltip>
    </>
  );
}
