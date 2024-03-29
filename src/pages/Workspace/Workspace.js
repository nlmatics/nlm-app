/* eslint-disable react/no-children-prop */
import {
  ArrowLeftOutlined,
  CloseCircleOutlined,
  CopyOutlined,
  DatabaseOutlined,
  ExclamationCircleOutlined,
  FileOutlined,
  MoreOutlined,
  NodeIndexOutlined,
  PieChartOutlined,
  SearchOutlined,
  SettingOutlined,
  SyncOutlined,
  TableOutlined,
} from '@ant-design/icons';
import {
  Button,
  Col,
  Dropdown,
  Form,
  Input,
  Layout,
  Menu,
  Modal,
  PageHeader,
  Row,
  Space,
  Spin,
  Tag,
  Tooltip,
} from 'antd';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  Link,
  Route,
  Switch,
  useHistory,
  useLocation,
  useParams,
  useRouteMatch,
} from 'react-router-dom';
import BetaFeature from '../../components/common/BetaFeature/BetaFeature.js';
import DictionaryUpload from '../../components/DictionaryUpload.js';
import MenuContainer from '../../components/workspace/MenuContainer';
import useWorkspaceDocumentsIngestionStatus from '../../components/workspace/useWorkspaceDocumentsIngestionStatus.js';
import WorkspaceReingester from '../../components/workspace/WorkspaceReingester';
import { WorkspaceContext } from '../../components/WorkspaceContext.js';
import WorkspaceEditor from '../../components/WorkspaceEditor.js';
import useUserInfo from '../../hooks/useUserInfo.js';
import useUserPermission from '../../hooks/useUserPermission.js';
import API from '../../utils/API.js';
import {
  cloneWorkspace,
  fetchGroupedWorkspacesByUser,
  fetchWorkspaces,
} from '../../utils/apiCalls.js';
import { roles } from '../../utils/constants';
import {
  clearWorkspaceSearchResults,
  selectCurrentWorkspace,
} from '../../utils/helpers';
import { useAuth } from '../../utils/use-auth.js';
import './index.less';

export default function Workspace() {
  const { workspaceId } = useParams();
  const auth = useAuth();
  const user = auth.user;
  const workspaceContext = useContext(WorkspaceContext);
  const [createWorkspace, setCreateWorkspace] = useState(true);
  const [workspaceEditorVisible, setWorkspaceEditorVisible] = useState(false);
  const [wsEdit, setWsEdit] = useState(true);
  const [dictionaryUploadVisible, setDictionaryUploadVisible] = useState(false);
  const [cloneVisible, setCloneVisible] = useState(false);
  const [cloneError, setCloneError] = useState(false);
  const [fetchingWorkspace, setFetchingWorkspace] = useState(false);
  const [workspace, setWorkspace] = useState({});
  const [activeMenuKey, setActiveMenuKey] = useState('documents');
  const { data: userInfo, isFeatureIncluded, FEATURES } = useUserInfo();

  const { isViewerRole } = useUserPermission();
  const latestExtractionsMenuKeyRef = useRef('data');
  const setLatestExtractionsMenuKey = useCallback(
    latestExtractionsMenuKey =>
      (latestExtractionsMenuKeyRef.current = latestExtractionsMenuKey),
    []
  );

  const location = useLocation();
  const history = useHistory();
  let { url, path } = useRouteMatch();
  const fromDocumentId = location.state?.fromDocumentId;
  const isDocumentIngestionTriggered =
    location.state?.isDocumentIngestionTriggered;

  const {
    isIngestionFailed,
    isIngestionInProgress,
    isReadyForIngestion,
    updateWorkspaceDocumentsIngestionStatus,
    workspaceDocumentsIngestionStatus,
  } = useWorkspaceDocumentsIngestionStatus(
    workspaceId,
    workspaceContext.documents
  );

  useEffect(() => {
    document.title = workspace.name
      ? `nlmatics: ${workspace.name}`
      : 'nlmatics';
  }, [workspace.name]);

  useEffect(() => {
    isDocumentIngestionTriggered && updateWorkspaceDocumentsIngestionStatus();
  }, [isDocumentIngestionTriggered, updateWorkspaceDocumentsIngestionStatus]);

  async function fetchWorkspaceById(workspaceId) {
    return await API.get(`/workspace/${workspaceId}`, {});
  }
  const fetchData = useCallback(
    async function fetchData(workspaceId) {
      setFetchingWorkspace(true);
      const response = await fetchWorkspaceById(workspaceId);
      setFetchingWorkspace(false);
      const currentWorkspace = response.data;
      setWorkspace(currentWorkspace);

      // if workspaces is not available in workspaceContext when
      // a workspace is visited directly then set it

      if (!workspaceContext.workspaces?.length) {
        fetchGroupedWorkspacesByUser(user, workspaceContext);
      }

      if (workspaceContext.currentWorkspaceId !== 'all') {
        workspaceContext.setPrevOpenedWorkspaceId(
          workspaceContext.currentWorkspaceId
        );
      }
      if (currentWorkspace) {
        if (currentWorkspace) {
          workspaceContext.setCurrentWorkspace(currentWorkspace);
          workspaceContext.setCurrentWorkspaceName(currentWorkspace.name);
          workspaceContext.setCurrentWorkspaceId(currentWorkspace.id);
        } else {
          workspaceContext.setCurrentWorkspace({
            id: 'all',
            collaborators: [],
          });
          workspaceContext.setCurrentWorkspaceId('all');
          workspaceContext.setCurrentWorkspaceName('');
          workspaceContext.setCurrentDocument({ id: 'all' });
        }

        var newCanEdit =
          currentWorkspace &&
          userInfo &&
          (userInfo.id === currentWorkspace.userId || userInfo.isAdmin);
        workspaceContext.setCurrentWorkspaceEditable(newCanEdit);
      }
    },
    [userInfo, user]
  );

  useEffect(() => {
    // Reset stuff when a new workspace is opened.
    clearWorkspaceSearchResults(workspaceContext);
    workspaceId && userInfo && fetchData(workspaceId);
  }, [workspaceId, userInfo, fetchData]);

  // Displays the Workspace Editor button if the user has access to editing the workspace
  const workspaceEditorButton = () => {
    if (workspaceContext.currentUserRole !== roles.VIEWER) {
      return (
        <Tooltip title="Edit/Share Workspace">
          <Button
            type="link"
            icon={<SettingOutlined></SettingOutlined>}
            onClick={() => {
              setWsEdit(true);
              setCreateWorkspace(false);
              openWorkspaceEditor();
            }}
          />
        </Tooltip>
      );
    }
  };

  const closeWorkspaceEditor = () => {
    setWorkspaceEditorVisible(false);
  };

  const handeleWorkspaceCreation = (formData, workspaceId) => {
    setWorkspaceEditorVisible(false);
    fetchWorkspaces(user, workspaceContext, formData.workspaceName);
    selectCurrentWorkspace(workspaceId, formData.workspaceName);
    history.push(`/workspace/${workspaceId}/documents`);
  };

  const openWorkspaceEditor = () => {
    setWorkspaceEditorVisible(true);
  };

  // Shows the clone workspace button
  const cloneWorkspaceButton = () => {
    return (
      <Tooltip title="Creates a new workspace with this workspace's field sets">
        <Button
          type="link"
          icon={<CopyOutlined />}
          onClick={() => {
            setCloneVisible(true);
          }}
        />
      </Tooltip>
    );
  };

  // Shows the add dictionary button
  const addDictionary = () => {
    return (
      <Tooltip title="Add a dictionary to workspace">
        <Button
          type="link"
          icon={<DatabaseOutlined />}
          onClick={() => {
            setDictionaryUploadVisible(true);
          }}
        />
      </Tooltip>
    );
  };

  const backToDocumentButton = () => {
    if (fromDocumentId && workspaceContext.currentDocument?.name) {
      return (
        <Link
          to={`/workspace/${workspaceId}/document/${fromDocumentId}/search`}
        >
          <Button icon={<ArrowLeftOutlined />}>
            {workspaceContext.currentDocument.name}
          </Button>
        </Link>
      );
    }
  };

  // Submits the clone workspace. Also checks that the new workspace name isn't a duplicate
  const submitClone = values => {
    // check if workspace name is already used
    const validationFailed = workspaceContext.workspaces.some(workspace => {
      return workspace.name === values.workspaceName;
    });
    setCloneError(validationFailed);

    if (!validationFailed) {
      setCloneVisible(false);
      cloneWorkspace(workspaceId, values.workspaceName, workspaceContext);
    }
  };

  const createTags = () => {
    if (isReadyForIngestion()) {
      return (
        <Tag icon={<ExclamationCircleOutlined />} color="default">
          queued for processing
        </Tag>
      );
    } else if (isIngestionInProgress()) {
      return (
        <Tag icon={<SyncOutlined spin />} color="processing">
          processing
        </Tag>
      );
    } else if (isIngestionFailed()) {
      return (
        <Tag icon={<CloseCircleOutlined />} color="error">
          failed
        </Tag>
      );
    } else {
      // Ingestion is completed
      return null;
    }
  };

  const disableTabs = workspaceContext.documents.length === 0;

  const getWorkspacePage = () => {
    return (
      <PageHeader
        title={fetchingWorkspace ? <Spin /> : workspace.name}
        breadcrumb={workspaceContext.routes}
        tags={createTags()}
        className="nlm-page-workspace"
        extra={
          <Space>
            {backToDocumentButton()}

            {!isViewerRole() && addDictionary()}
            {!isViewerRole() && cloneWorkspaceButton()}
            {workspaceEditorButton()}
            {!isViewerRole() && (
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'reingest',
                      label: (
                        <WorkspaceReingester
                          workspaceId={workspaceId}
                          currentWorkspaceEditable={
                            workspaceContext.currentWorkspaceEditable
                          }
                          isWorkspaceIngestionInProgress={
                            isReadyForIngestion() || isIngestionInProgress()
                          }
                          updateWorkspaceDocumentsIngestionStatus={
                            updateWorkspaceDocumentsIngestionStatus
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
        }
      >
        <Layout>
          <Layout.Content>
            <Row>
              <Col span={24}>
                <Menu
                  theme="light"
                  mode="horizontal"
                  selectedKeys={[activeMenuKey]}
                  onSelect={({ key }) => setActiveMenuKey(key)}
                  items={[
                    {
                      key: 'documents',
                      icon: <FileOutlined />,
                      label: <Link to={`${url}/documents`}>Documents</Link>,
                    },
                    {
                      key: 'search',
                      icon: <SearchOutlined />,
                      disabled: disableTabs,
                      label: <Link to={`${url}/search`}>Search</Link>,
                    },
                    ...(isFeatureIncluded(FEATURES.EXTRACTION)
                      ? [
                          {
                            key: 'extractions',
                            icon: <TableOutlined />,
                            disabled: disableTabs,
                            label: (
                              <Link
                                to={`${url}/extractions/${latestExtractionsMenuKeyRef.current}`}
                              >
                                Extractions
                              </Link>
                            ),
                          },
                        ]
                      : []),
                    ...(isFeatureIncluded(FEATURES.RELATION_EXTRACTION)
                      ? [
                          {
                            key: 'relations',
                            icon: <NodeIndexOutlined />,
                            disabled: disableTabs,
                            label: (
                              <Link to={`${url}/relations/type/triple`}>
                                Relations
                              </Link>
                            ),
                          },
                        ]
                      : []),
                    ...(isFeatureIncluded(FEATURES.VISUALIZATION)
                      ? [
                          {
                            key: 'analytics',
                            icon: <PieChartOutlined />,
                            disabled: disableTabs,
                            label: (
                              <Link to={`${url}/analytics/fields`}>
                                {disableTabs ? (
                                  'Analytics'
                                ) : (
                                  <BetaFeature>Analytics</BetaFeature>
                                )}
                              </Link>
                            ),
                          },
                        ]
                      : []),
                  ]}
                />
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Switch>
                  <Route path={`${path}/:activeMenuKey`}>
                    <MenuContainer
                      setActiveMenuKey={setActiveMenuKey}
                      setLatestExtractionsMenuKey={setLatestExtractionsMenuKey}
                      workspaceId={workspaceId}
                      currentActiveMenuKey={activeMenuKey}
                      workspaceDocumentsIngestionStatus={
                        workspaceDocumentsIngestionStatus
                      }
                    />
                  </Route>
                </Switch>
              </Col>
            </Row>
          </Layout.Content>
        </Layout>
        <WorkspaceEditor
          onClose={closeWorkspaceEditor}
          workspaceId={workspaceId}
          createWorkspace={createWorkspace}
          visible={workspaceEditorVisible}
          wsEdit={wsEdit}
          onWorkspaceCreate={handeleWorkspaceCreation}
          onWorkspaceEdit={() => {
            closeWorkspaceEditor();
            fetchData(workspaceId);
          }}
        />
        <DictionaryUpload
          onClose={() => {
            setDictionaryUploadVisible(false);
          }}
          visible={dictionaryUploadVisible}
        />
        {/* The Clone Workspace Modal */}
        <Modal
          title="Clone Fields to New Workspace"
          open={cloneVisible}
          onCancel={() => {
            setCloneVisible(false);
          }}
          footer={[
            <Button
              key="modal-cancel"
              onClick={() => {
                setCloneVisible(false);
              }}
            >
              Cancel
            </Button>,
            <Button
              type="primary"
              form="cloneForm"
              key="submit"
              htmlType="submit"
            >
              Submit
            </Button>,
          ]}
        >
          <h2>Instructions</h2>
          <p>
            Cloning a workspace will create a new workspace with the same field
            sets as this current workspace. The documents
            <b> will not</b> be copied over to the new workspace. The intention
            is for you to use these same field sets on your own documents.
          </p>
          <br />
          <p>Please enter the name of the new workspace.</p>
          <Form id="cloneForm" name="clone" onFinish={submitClone}>
            <Form.Item
              name="workspaceName"
              validateStatus={cloneError ? 'error' : 'success'}
              help={cloneError ? 'Duplicated Workspace Name' : ''}
            >
              <Input placeholder="New Workspace Name" />
            </Form.Item>
          </Form>
        </Modal>
      </PageHeader>
    );
  };
  return <Layout>{getWorkspacePage()}</Layout>;
}
