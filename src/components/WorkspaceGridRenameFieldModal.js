import { Modal, Form, Input, Button } from 'antd';
import { useState } from 'react';

const WorkspaceGridRenameFieldModal = ({
  fieldToBeRenamed,
  hideModal,
  renameField,
  onRenameCallback,
}) => {
  const [confirmLoading, setConfirmLoading] = useState(false);
  const { id, name } = fieldToBeRenamed;

  const onFinish = async ({ newFieldName }) => {
    setConfirmLoading(true);
    await renameField({ fieldId: id, name: newFieldName });
    setConfirmLoading(false);
    onRenameCallback({ newFieldName, oldFieldName: name });
    hideModal();
  };

  return (
    <Modal
      title={`Rename field ${name}`}
      open
      confirmLoading={confirmLoading}
      onCancel={hideModal}
      footer={
        <>
          <Button
            type="primary"
            form="rename-field"
            htmlType="submit"
            loading={confirmLoading}
          >
            Rename
          </Button>
          <Button htmlType="button" onClick={hideModal}>
            Cancel
          </Button>
        </>
      }
    >
      <Form name="rename-field" onFinish={onFinish}>
        <Form.Item
          label="New field name"
          name="newFieldName"
          rules={[{ required: true, message: 'Please enter field name!' }]}
        >
          <Input autoFocus />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default WorkspaceGridRenameFieldModal;
