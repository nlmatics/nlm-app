import { Button, Modal, Result } from 'antd';
import { useState } from 'react';

const WorkspaceGridDeleteFieldModal = ({
  fieldToBeDeleted,
  hideModal,
  deleteField,
  onDeleteCallback,
}) => {
  const [confirmLoading, setConfirmLoading] = useState(false);
  const { id, name } = fieldToBeDeleted;

  const onDelete = async () => {
    setConfirmLoading(true);
    await deleteField(id);
    setConfirmLoading(false);
    onDeleteCallback(name);
    hideModal();
  };

  return (
    <Modal
      title={`Delete field ${name}`}
      open
      confirmLoading={confirmLoading}
      onCancel={hideModal}
      footer={
        <>
          <Button
            type="primary"
            form="delete-field"
            onClick={onDelete}
            loading={confirmLoading}
          >
            Delete
          </Button>
          <Button htmlType="button" onClick={hideModal}>
            Cancel
          </Button>
        </>
      }
    >
      <Result
        status="warning"
        title="You will lose all the data associated with this field."
        subTitle={`Do you want to delete ${name} ?`}
      />
    </Modal>
  );
};

export default WorkspaceGridDeleteFieldModal;
