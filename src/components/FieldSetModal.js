import { useContext, useState } from 'react';
import { Button, Spin, Form, Modal, Input, Divider } from 'antd';
import { WorkspaceContext } from './WorkspaceContext.js';
import API from '../utils/API.js';
import { useAuth } from '../utils/use-auth.js';

import { deleteFieldSetId } from '../utils/apiCalls.js';
import { TrashIcon } from '../assets/Icons.js';
import { FileFilled } from '@ant-design/icons';

export default function FieldSetModal(props) {
  // eslint-disable-next-line
  const [wsEdit, setWsEdit] = useState(true);
  // eslint-disable-next-line
  const [createWorkspace, setCreateWorkspace] = useState(true);
  const workspaceContext = useContext(WorkspaceContext);
  // eslint-disable-next-line
  const [workspaceEditorVisible, setWorkspaceEditorVisible] = useState(false);
  // eslint-disable-next-line
  const [fileUploadVisible, setFileUploadVisible] = useState(false);
  // eslint-disable-next-line
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleCancel = () => {
    // setDeleteFsData({id:"", name:""});
    props.onClose();
  };

  const createFieldSet = async fieldsData => {
    setLoading(true);
    try {
      let response = await API.post(
        `/fieldBundle`,
        {
          bundleName: fieldsData.viewName,
          workspaceId: workspaceContext.currentWorkspaceId,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.id === 'error') {
        form.setFields([
          {
            name: 'viewName',
            errors: [response.data.message],
          },
        ]);
      } else {
        props.onCreateFieldBundle(response.data.id);
      }
      handleCancel();
    } catch (error) {
      form.setFields([
        {
          name: 'viewName',
          errors: ['Server Error'],
        },
      ]);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        open={props.createVisible}
        title="Create Field Set"
        okText="Create"
        cancelText="Cancel"
        onCancel={handleCancel}
        destroyOnClose={true}
        onOk={() => {
          form
            .validateFields()
            .then(values => {
              form.resetFields();
              createFieldSet(values);
            })
            .catch(info => {
              console.log('Validate Failed:', info);
            });
        }}
      >
        <Spin tip="creating..." spinning={loading}>
          <Form form={form} layout="vertical" name="form_in_modal">
            <Form.Item
              name="viewName"
              label="Field Set Name"
              rules={[
                {
                  required: true,
                  message: 'Please input the name of view!',
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
      <Modal
        okText="DELETE"
        cancelText="CANCEL"
        open={props.deleteVisible}
        onCancel={handleCancel}
        footer={[
          <Button
            key="submit"
            type="primary"
            danger
            loading={loading}
            onClick={async () => {
              const {
                workspaceId,
                fieldBundleId,
                fieldBundleName,
                onDeleteFieldBundle,
              } = props;
              await deleteFieldSetId({
                workspaceId,
                fieldBundleId,
                fieldBundleName,
              });
              onDeleteFieldBundle();
              handleCancel();
            }}
          >
            DELETE
          </Button>,
          <Button key="back" onClick={() => handleCancel()}>
            CANCEL
          </Button>,
        ]}
      >
        <div>
          <div style={{ display: 'flex' }}>
            <div>
              <TrashIcon className="field-set-modal--trash-icon" />
            </div>
            <div>
              <h4 style={{ marginBottom: 0 }}>
                Are you sure you want to delete this field set?
              </h4>
              <h4>This action cannot be undone</h4>
            </div>
          </div>
          <Divider
            style={{
              marginTop: '5px',
              marginBottom: '20px',
              minWidth: '89%',
              width: '89%',
              marginLeft: 'auto',
            }}
          />
          <div style={{ marginLeft: '64px' }}>
            <FileFilled /> {props.fieldBundleName}
          </div>
        </div>{' '}
      </Modal>
    </>
  );
}
