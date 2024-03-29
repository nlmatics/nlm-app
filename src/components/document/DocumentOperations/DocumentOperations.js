import { DeleteOutlined, EditOutlined, MoreOutlined } from '@ant-design/icons';
import {
  Button,
  Dropdown,
  Modal,
  Popconfirm,
  Space,
  Tooltip,
  Typography,
} from 'antd';
import { useContext, useState } from 'react';
import AppContext from '../../../contexts/app/AppContext';
import DocumentContext from '../../../contexts/document/DocumentContext';
import { deleteFileId, renameFileCrud } from '../../../utils/apiCalls';
import DocumentReingester from '../DocumentReingester';

export default function DocumentOperations({
  documentId,
  currentWorkspaceEditable,
  currentDocument,
  currentUserRole,
  userInfo,
  isDocumentIngestionInProgress,
  updateDocumentIngestionStatus,
  workspaceContext,
  workspaceId,
  onDelete,
}) {
  const [loading, setLoading] = useState(false);
  const [renameFileVisible, setRenameFileVisible] = useState(false);
  const [newDocumentName, setNewDocumentName] = useState('');
  const { closeDocument } = useContext(DocumentContext);
  const { isChattyPdf } = useContext(AppContext);
  const isOperationDisabled = () => {
    return (
      !userInfo ||
      !currentWorkspaceEditable ||
      documentId === '' ||
      currentDocument?.userId !== userInfo.id
    );
  };

  return (
    <>
      <Space>
        <Tooltip title={`Rename ${currentDocument?.name}`}>
          <Button
            disabled={isOperationDisabled()}
            icon={<EditOutlined />}
            hidden={!documentId}
            onClick={() => setRenameFileVisible(true)}
          ></Button>
        </Tooltip>
        <Tooltip title={`Delete ${currentDocument?.name}`}>
          <Popconfirm
            placement="bottom"
            title="Are you sure you want to delete?"
            onConfirm={async () => {
              const deletedDocumentId = await deleteFileId(
                workspaceContext,
                documentId,
                currentDocument?.name
              );
              onDelete && onDelete(deletedDocumentId);
              closeDocument();
            }}
            okText="Yes"
            cancelText="No"
            disabled={isOperationDisabled()}
          >
            <Button
              disabled={isOperationDisabled()}
              icon={<DeleteOutlined />}
              hidden={!documentId}
            ></Button>
          </Popconfirm>
        </Tooltip>
        {!isChattyPdf() && (
          <Dropdown
            menu={{
              items: [
                {
                  key: 'docreingest',
                  label: (
                    <DocumentReingester
                      currentWorkspaceEditable={currentWorkspaceEditable}
                      isDocumentIngestionInProgress={
                        isDocumentIngestionInProgress
                      }
                      currentDocument={currentDocument}
                      currentUserRole={currentUserRole}
                      documentId={documentId}
                      updateDocumentIngestionStatus={
                        updateDocumentIngestionStatus
                      }
                    />
                  ),
                },
              ],
            }}
            trigger={['click']}
          >
            <Button type="link" icon={<MoreOutlined />}></Button>
          </Dropdown>
        )}
      </Space>

      <Modal
        open={renameFileVisible}
        onCancel={() => setRenameFileVisible(false)}
        footer={[
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={() => {
              renameFileCrud({
                workspaceContext,
                newDocumentName,
                setLoading,
                setRenameFileVisible,
                setNewDocumentName,
                documentId,
                workspaceId,
              });
            }}
          >
            Rename
          </Button>,
          <Button
            key="back"
            onClick={() => {
              setRenameFileVisible(false);
              setNewDocumentName('');
            }}
          >
            Cancel
          </Button>,
        ]}
      >
        <div>
          <h3 style={{ marginBottom: '15px' }}> Rename file to : </h3>
          <Typography.Text
            style={{ marginLeft: '10px' }}
            editable={{
              onChange: newName => setNewDocumentName(newName),
            }}
          >
            {newDocumentName ? newDocumentName : currentDocument?.name}
          </Typography.Text>
        </div>
      </Modal>
    </>
  );
}
