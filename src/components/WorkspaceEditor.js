import { useState, useEffect, useContext } from 'react';
import { WorkspaceContext } from './WorkspaceContext.js';
import { useAuth } from '../utils/use-auth.js';
import API from '../utils/API.js';
import { fetchWorkspaces, archiveWorkspace } from '../utils/apiCalls.js';
import {
  Modal,
  Form,
  Input,
  Spin,
  Select,
  Checkbox,
  Button,
  Space,
  Alert,
} from 'antd';
import { CloseCircleOutlined, PlusOutlined } from '@ant-design/icons';
import useUserInfo from '../hooks/useUserInfo.js';

const { Option } = Select;

// TODO: Reduce functional complexity
export default function WorkspaceEditor(props) {
  // nosonar
  // We need to declare the state variable, even if it's never used
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line
  const [deleteVisible, setDeleteVisible] = useState(false); // nosonar
  const [archiveChecked, setArchiveChecked] = useState(false);
  const [workspaceEditorVisible, setWorkspaceEditorVisible] = useState(false);
  const [form] = Form.useForm();
  const auth = useAuth();
  const user = auth.user;
  const [okText, setOKText] = useState('Create');
  const [waitMessage, setWaitMessage] = useState('processing your request..');
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState();
  const workspaceContext = useContext(WorkspaceContext);
  const { data: userInfo } = useUserInfo();

  const handleCancel = () => {
    props.onClose();
  };

  useEffect(() => {
    let formValues = {
      workspaceName: '',
      isPublic: false,
      collaborators: [],
    };
    form.setFieldsValue(formValues);
  }, []);

  useEffect(() => {
    setSelectedWorkspaceId('');
    if (props.workspaceId && props.visible && !props.createWorkspace) {
      setOKText('Save');
      setSelectedWorkspaceId(props.workspaceId);
      getWorkspaceInfo(props.workspaceId);
    } else {
      setOKText('Create');
    }
    setWorkspaceEditorVisible(props.visible);
  }, [props.visible]);

  const getWorkspaceInfo = async workspaceId => {
    try {
      setLoading(true);
      let res = await API.get(`workspace/${workspaceId}`, {
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      var fieldData = res.data;
      // constructs the collaborator data that the form requires
      // {<email1>: <role1>, <email2>: <role2>} => [{email: <email1>, role: <role1>}, {email: <email2>, role: <role2>}]
      let collaboratorArr = [];
      Object.keys(fieldData.collaborators).forEach(email => {
        if (email !== '*') {
          let collaboratorObj = {
            email: email,
            role: fieldData.collaborators[email],
          };
          collaboratorArr.push(collaboratorObj);
        }
      });

      var formValues = {
        workspaceName: fieldData.name,
        isPublic: Object.keys(fieldData.collaborators).includes('*'),
        collaborator: collaboratorArr,
      };
      if (
        fieldData.settings &&
        Object.prototype.hasOwnProperty.call(fieldData.settings, 'domain')
      ) {
        formValues.domain = fieldData.settings.domain;
      } else {
        formValues.domain = 'general';
      }
      form.setFieldsValue(formValues);
      return res.data;
    } catch (err) {
      console.error(err);
      form.setFields([
        {
          name: 'fieldName',
          errors: ['Server Error'],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onChange = e => {
    if (e.target.checked) {
      setArchiveChecked(true);
    } else {
      setArchiveChecked(false);
    }
  };

  const onWorkspaceEdited = async fieldsData => {
    setLoading(true);
    try {
      let collaboratorObj = {};
      if (fieldsData.isPublic) {
        collaboratorObj['*'] = 'viewer';
      }
      if (fieldsData.collaborator) {
        fieldsData.collaborator.forEach(person => {
          if (person.role === undefined) {
            collaboratorObj[person.email] = 'viewer';
          } else {
            collaboratorObj[person.email] = person.role;
          }
        });
      }
      var workspaceInfo = {
        name: fieldsData.workspaceName,
        collaborators: collaboratorObj,
      };
      var response = null;
      if (selectedWorkspaceId) {
        setWaitMessage('saving...');
        response = await API.post(
          `/workspace/modify/${selectedWorkspaceId}`,
          workspaceInfo,
          {
            headers: {
              'Content-Type': 'application/json; charset=UTF-8',
            },
          }
        );
      } else {
        setWaitMessage('creating...');
        response = await API.post(`/workspace`, workspaceInfo, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
      if (response.data.id === 'error') {
        form.setFields([
          {
            name: 'workspaceName',
            errors: [response.data.message],
          },
        ]);
      } else {
        fetchWorkspaces(user, workspaceContext, fieldsData.workspaceName);
        let workspaceSettings = { domain: fieldsData.domain };
        let workspaceId = selectedWorkspaceId
          ? selectedWorkspaceId
          : response.data.id;
        response = await API.post(
          `/updateWorkspaceSettings/${workspaceId}`,
          workspaceSettings,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        if (response.data.id === 'error') {
          form.setFields([
            {
              name: 'workspaceName',
              errors: [response.data.message],
            },
          ]);
        } else {
          if (selectedWorkspaceId) {
            props.onWorkspaceEdit();
          } else {
            props.onWorkspaceCreate(fieldsData, response.data.id);
          }
        }
      }
      if (archiveChecked) {
        archiveWorkspace(
          user,
          workspaceContext,
          setDeleteVisible,
          setWorkspaceEditorVisible,
          setLoading
        );
        props.onWorkspaceEdit();
        setArchiveChecked(false);
      }
    } catch (error) {
      form.setFields([
        {
          name: 'workspaceName',
          errors: ['Server Error'],
        },
      ]);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const sharingStyle = {
    marginBottom: '.35em',
    textIndent: '-5px',
  };

  // displays archive warning
  const archived = archiveChecked ? (
    <p style={{ textIndent: '5px' }}>
      Archiving this Workspace will remove all of its associated data, including
      documents, saved searches, and overrides. Please contact your system
      administrator to undo this action.
    </p>
  ) : (
    <p></p>
  );

  return (
    <Modal
      open={workspaceEditorVisible}
      title={props.wsEdit === true ? 'Workspace Editor' : 'Workspace Creator'} // if save is oktext
      okText={okText}
      cancelText="Cancel"
      onCancel={handleCancel}
      destroyOnClose={true}
      okButtonProps={{
        disabled:
          props.wsEdit &&
          props.workspaceId &&
          userInfo &&
          workspaceContext.currentWorkspace &&
          workspaceContext.currentWorkspace.userId !== userInfo?.id,
      }}
      onOk={() => {
        form
          .validateFields()
          .then(values => {
            onWorkspaceEdited(values);
          })
          .catch(info => {
            console.error('Validate Failed:', info);
          });
      }}
      getContainer={false}
      forceRender={true}
    >
      <Spin tip={waitMessage} spinning={loading}>
        <Form form={form} layout="vertical" name="form_in_modal">
          <Form.Item
            name="workspaceName"
            label="Workspace Name"
            rules={[
              {
                required: true,
                message: 'Please input the name of workspace!',
              },
              () => ({
                validator() {
                  if (
                    !workspaceContext.workspaces.some(
                      el => el.name === form.getFieldValue('workspaceName')
                    ) ||
                    form.getFieldValue('workspaceName') ===
                      workspaceContext.currentWorkspaceName
                  ) {
                    return Promise.resolve();
                  }

                  return Promise.reject('A duplicate name already exists!');
                },
              }),
            ]}
          >
            <Input
              disabled={
                props.wsEdit &&
                props.workspaceId &&
                userInfo &&
                workspaceContext.currentWorkspace &&
                workspaceContext.currentWorkspace.userId !== userInfo?.id
              }
            />
          </Form.Item>
          <Form.Item name="domain" label="Domain">
            <Select defaultValue={'general'}>
              <Option value="general">General</Option>
              <Option value="biology">Biomedical</Option>
            </Select>
          </Form.Item>
          <p style={sharingStyle}>
            <b>Sharing Permissions</b>
          </p>
          {userInfo && userInfo?.isAdmin && (
            <Form.Item name="isPublic" valuePropName="checked">
              <Checkbox
                disabled={
                  props.wsEdit &&
                  props.workspaceId &&
                  userInfo &&
                  workspaceContext.currentWorkspace &&
                  workspaceContext.currentWorkspace.userId !== userInfo?.id
                }
              >
                Public (All nlmatics Users)
                <Alert
                  message="Public option not recommended"
                  description="Checking public option will enable anyone using nlmatics to see your files."
                  type="error"
                ></Alert>
              </Checkbox>
            </Form.Item>
          )}
          <Form.List name="collaborator">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, fieldKey, ...restField }) => (
                  <Space key={key} style={{ display: 'flex' }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'email']}
                      fieldKey={[fieldKey, 'email']}
                      rules={[
                        {
                          required: true,
                          message: 'Please enter an email or domain',
                        },
                      ]}
                    >
                      <Input
                        placeholder="Email address or company domain"
                        style={{ width: 300 }}
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'role']}
                      fieldKey={[fieldKey, 'role']}
                    >
                      <Select defaultValue="viewer" style={{ width: '10em' }}>
                        <Option value="viewer">Viewer</Option>
                        <Option value="editor">Editor</Option>
                      </Select>
                    </Form.Item>
                    <CloseCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button
                    aria-label="Add Collaborator"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add Collaborator
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
          {props.wsEdit === true ? (
            <Checkbox
              disabled={
                props.workspaceId &&
                workspaceContext.currentWorkspace &&
                userInfo &&
                workspaceContext.currentWorkspace.userId !== userInfo?.id
              }
              name="isArchived"
              style={{ textIndent: '-5px' }}
              onChange={onChange}
              checked={archiveChecked}
            >
              <b>Archive Workspace</b>
              {archived}
            </Checkbox>
          ) : (
            ''
          )}
        </Form>
      </Spin>
    </Modal>
  );
}
