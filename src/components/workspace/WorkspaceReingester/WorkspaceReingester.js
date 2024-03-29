import {
  InteractionOutlined,
  MailOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { Button, Modal, Result, Tooltip } from 'antd';
import { useState } from 'react';
import { reIngestWorkspace } from '../../../utils/apiCalls';

export default function WorkspaceReingester({
  isWorkspaceIngestionInProgress,
  updateWorkspaceDocumentsIngestionStatus,
  workspaceId,
  currentWorkspaceEditable,
}) {
  const [isReingestWorkspaceModalVisible, setIsReingestWorkspaceModalVisible] =
    useState(false);

  const showModal = () => {
    setIsReingestWorkspaceModalVisible(true);
  };

  const handleOk = async () => {
    setIsReingestWorkspaceModalVisible(false);
    await reIngestWorkspace(workspaceId);
    updateWorkspaceDocumentsIngestionStatus();
  };

  const handleOkWithOCR = async () => {
    setIsReingestWorkspaceModalVisible(false);
    await reIngestWorkspace(workspaceId, true);
    setIsReingestWorkspaceModalVisible();
  };

  const handleCancel = () => {
    setIsReingestWorkspaceModalVisible(false);
  };
  return (
    <>
      <Modal
        title="Reingest Workspace"
        open={isReingestWorkspaceModalVisible}
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
          title="Reingest entire workspace?"
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
        placement="left"
        title={
          isWorkspaceIngestionInProgress
            ? 'Reingesting workspace'
            : 'Reingest all the docs in workspace'
        }
      >
        <Button
          type="link"
          disabled={!currentWorkspaceEditable || isWorkspaceIngestionInProgress}
          icon={
            isWorkspaceIngestionInProgress ? (
              <SyncOutlined spin />
            ) : (
              <InteractionOutlined />
            )
          }
          onClick={showModal}
        />
      </Tooltip>
    </>
  );
}
