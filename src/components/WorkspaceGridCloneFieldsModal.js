import { Modal, Form, Button, Select, message, Input } from 'antd';
import { useEffect, useState } from 'react';
import { showError } from '../utils/apiCalls';
import API from '../utils/API';

const cloneFieldsToWorkspace = async ({
  fieldId,
  targetWorkspaceId,
  targetFieldBundleId,
  targetFieldName,
}) => {
  try {
    const {
      data: { field_ids },
    } = await API.post(
      `/field/clone/${fieldId}`,
      {},
      {
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
        params: { targetWorkspaceId, targetFieldBundleId, targetFieldName },
      }
    );
    return field_ids[0];
  } catch (error) {
    showError(error);
  }
};

const WorkspaceGridCloneFieldModal = ({
  fieldToBeCloned,
  workspaces,
  hideModal,
  onFieldClone,
  workspaceId,
  fieldBundleId,
}) => {
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmAndRedirectLoading, setConfirmAndRedirectLoading] =
    useState(false);
  const [targetWorkspaceId, setTargetWorkspaceId] = useState(workspaceId);
  const [fieldSets, setFieldSets] = useState([]);
  const [fetchingFieldSets, setFetchingFieldSets] = useState(false);
  const [targetFieldBundleId, setTargetFieldBundleId] = useState(fieldBundleId);
  const { id, name } = fieldToBeCloned;
  const { Option } = Select;
  let isCloneAndRedirect = false;
  const [form] = Form.useForm();

  useEffect(() => {
    async function fetchFieldSets() {
      setFetchingFieldSets(true);
      let response = await API.get(`/fieldBundle`, {
        params: {
          workspaceId: targetWorkspaceId,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setFetchingFieldSets(false);
      setFieldSets(response.data);
      form.setFieldValue('targetFieldBundleId', response.data[0]?.id);
    }
    targetWorkspaceId && fetchFieldSets();
  }, [targetWorkspaceId, form]);

  const onFinish = async ({
    targetWorkspaceId,
    targetFieldBundleId,
    targetFieldName,
  }) => {
    isCloneAndRedirect
      ? setConfirmAndRedirectLoading(true)
      : setConfirmLoading(true);
    const clonedFieldId = await cloneFieldsToWorkspace({
      fieldId: id,
      targetWorkspaceId,
      targetFieldBundleId,
      targetFieldName,
    });
    isCloneAndRedirect
      ? setConfirmAndRedirectLoading(false)
      : setConfirmLoading(false);

    hideModal();
    message.success(`${name} is successfully cloned into ${targetFieldName}.`);
    onFieldClone({
      clonedFieldId,
      targetWorkspaceId,
      targetFieldBundleId,
      isCloneAndRedirect,
    });
  };

  return (
    <Modal
      title={`Clone Field ${name}`}
      open
      confirmLoading={confirmLoading || confirmAndRedirectLoading}
      onCancel={hideModal}
      footer={
        <>
          <Button
            disabled={
              !targetWorkspaceId ||
              !targetFieldBundleId ||
              confirmAndRedirectLoading
            }
            type="primary"
            form="clone-field"
            htmlType="submit"
            loading={confirmLoading}
            onClick={() => {
              isCloneAndRedirect = false;
            }}
          >
            Clone
          </Button>
          <Button
            disabled={
              !targetWorkspaceId || !targetFieldBundleId || confirmLoading
            }
            type="primary"
            form="clone-field"
            htmlType="submit"
            hidden={!targetWorkspaceId || workspaceId === targetWorkspaceId}
            loading={confirmAndRedirectLoading}
            onClick={() => {
              isCloneAndRedirect = true;
            }}
          >
            Clone And Open Target Workspace
          </Button>
          <Button htmlType="button" onClick={hideModal}>
            Cancel
          </Button>
        </>
      }
    >
      <Form
        form={form}
        name="clone-field"
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ targetWorkspaceId, targetFieldBundleId }}
      >
        <Form.Item
          label="Target Workspace"
          name="targetWorkspaceId"
          rules={[{ required: true, message: 'Please select a workspace!' }]}
        >
          <Select
            showSearch
            placeholder="Select a workspace"
            optionFilterProp="children"
            onChange={targetWorkspaceId => {
              setTargetWorkspaceId(targetWorkspaceId);
            }}
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
          >
            {workspaces.map(({ id, name }) => (
              <Option key={id} value={id}>
                {name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="Target Field Set"
          name="targetFieldBundleId"
          rules={[{ required: true, message: 'Please select field set!' }]}
        >
          <Select
            showSearch
            disabled={fieldSets.length === 0}
            loading={fetchingFieldSets}
            placeholder="Select a field set"
            optionFilterProp="children"
            onChange={targetWorkspaceId => {
              setTargetFieldBundleId(targetWorkspaceId);
            }}
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
          >
            {fieldSets.map(({ id, bundleName }) => (
              <Option key={id} value={id}>
                {bundleName}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="Field Name"
          name="targetFieldName"
          rules={[{ required: true, message: 'Please enter field name!' }]}
        >
          <Input autoFocus></Input>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default WorkspaceGridCloneFieldModal;
