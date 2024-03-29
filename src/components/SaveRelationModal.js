import { Modal, Form, Input, Button } from 'antd';
import { useState } from 'react';

const SaveRelationModal = ({ hideModal, onSaveCallback }) => {
  const [confirmLoading, setConfirmLoading] = useState(false);
  const onFinish = async ({ newFieldName }) => {
    setConfirmLoading(true);
    await onSaveCallback(newFieldName);
    setConfirmLoading(false);
    hideModal();
  };

  return (
    <Modal
      title={`Field Name:`}
      open
      confirmLoading={confirmLoading}
      onCancel={hideModal}
      footer={
        <>
          <Button
            type="primary"
            form="save-field"
            htmlType="submit"
            loading={confirmLoading}
          >
            Save
          </Button>
          <Button htmlType="button" onClick={hideModal}>
            Cancel
          </Button>
        </>
      }
    >
      <Form name="save-field" onFinish={onFinish}>
        <Form.Item
          label="New field name"
          name="newFieldName"
          rules={[{ required: true, message: 'Please enter field name!' }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SaveRelationModal;
