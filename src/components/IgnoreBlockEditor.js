import { useState } from 'react';
import { Modal, Form, Input, Spin, Select, Checkbox } from 'antd';

export default function WorkspaceEditor() {
  // eslint-disable-next-line
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  // eslint-disable-next-line
  const [ignoreBlockEditorVisible, setIgnoreBlockEditorVisible] =
    useState(false);

  return (
    <Modal open={ignoreBlockEditorVisible}>
      <Spin tip="creating..." spinning={loading}>
        <Form form={form} layout="vertical" name="form_in_modal">
          <Form.Item
            name="ignoreText"
            label="Ignore Text"
            rules={[
              {
                required: true,
                message: 'Please input text to ignore!',
              },
            ]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            label="Ignore all text after this block?"
            name="ignoreAll"
            valuePropName="checked"
          >
            <Checkbox></Checkbox>
          </Form.Item>
          <Form.Item label="Text Type">
            <Select>
              <Select.Option value="header">Section Header</Select.Option>
              <Select.Option value="para">Paragraph</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
}
