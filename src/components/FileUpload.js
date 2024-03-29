import { useState, useEffect } from 'react';
import { Modal } from 'antd';
import FileDrop from './FileDrop';

export default function FileUpload({
  visible,
  showInline,
  onClose,
  workspaceDocumentsIngestionStatus,
}) {
  const [fileUploadVisible, setFileUploadVisible] = useState(false);

  useEffect(() => {
    setFileUploadVisible(visible && !showInline);
  }, [visible]);

  const handleCancel = () => {
    onClose();
  };

  return (
    <>
      {!showInline ? (
        <Modal
          title="Upload File"
          open={fileUploadVisible} // keep modal open if a file failed
          footer={null}
          onCancel={handleCancel}
          destroyOnClose={true}
        >
          <FileDrop
            workspaceDocumentsIngestionStatus={
              workspaceDocumentsIngestionStatus
            }
          />
        </Modal>
      ) : (
        <div>
          <FileDrop
            workspaceDocumentsIngestionStatus={
              workspaceDocumentsIngestionStatus
            }
          />
        </div>
      )}
    </>
  );
}
