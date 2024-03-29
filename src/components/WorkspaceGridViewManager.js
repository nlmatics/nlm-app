import {
  CopyOutlined,
  DeleteOutlined,
  PlusOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import {
  Button,
  Col,
  Form,
  Input,
  message,
  Popconfirm,
  Popover,
  Row,
  Select,
  Tooltip,
} from 'antd';
import { useCallback, useEffect, useState } from 'react';
import useUserPermission from '../hooks/useUserPermission';
import API from '../utils/API';
import { showError } from '../utils/apiCalls';

const getViewById = ({ viewId, views }) =>
  views.find(({ id }) => id === viewId);

const saveView = async ({
  name,
  columnState,
  filterModel,
  workspaceId,
  fieldSetId,
  userId,
}) => {
  try {
    return await API.post(
      `/workspaceFilter`,
      {
        isUserDefined: true,
        name,
        options: {
          fieldSetId,
          columnState,
          filterModel,
        },
        userId,
        workspaceId,
      },
      {
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
      }
    );
  } catch (error) {
    showError(error);
  }
};

const updateView = async ({
  columnState,
  filterModel,
  viewId,
  fieldSetId,
  viewName,
  userId,
  workspaceId,
}) => {
  try {
    return await API.post(
      `/workspaceFilter/modify/${viewId}`,
      {
        options: {
          columnState,
          filterModel,
          fieldSetId,
        },
        userId,
        workspaceId,
        name: viewName,
      },
      {
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
      }
    );
  } catch (error) {
    showError(error);
  }
};

const deleteView = async viewId => {
  try {
    return await API.post(
      `/workspaceFilter/delete/${viewId}`,
      {},
      {
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
      }
    );
  } catch (error) {
    showError(error);
  }
};

const fetchViews = async workspaceId => {
  return await API.get(`/workspaceFilter`, {
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    },
    params: {
      workspaceId,
    },
  });
};

function WorkspaceGridViewManager({
  getColumnState,
  getFilterModel,
  workspaceId,
  fieldSetId,
  userId,
  updateGrid,
  resetGrid,
}) {
  const [isSavingView, setIsSavingView] = useState(false);
  const [isUpdatingView, setIsUpdatingView] = useState(false);
  const [views, setViews] = useState([]);
  const [view, setView] = useState(null);
  const [showSaveAsPopover, setShowSaveAsPopover] = useState(false);
  const { Option } = Select;
  const { isViewerRole } = useUserPermission();
  useEffect(() => {
    async function getViews() {
      const response = await fetchViews(workspaceId);
      const views = response.data.filter(
        ({ options: { isVisualization } }) => !isVisualization
      );
      setViews(views);
      if (views?.length && updateGrid) {
        const view = views[0];
        setView(view);
        const {
          options: { columnState, filterModel },
          id,
        } = view;
        updateGrid({ columnState, filterModel, viewId: id });
      } else {
        resetGrid();
      }
    }
    workspaceId && updateGrid && getViews();
  }, [workspaceId, updateGrid]);

  const onViewChange = useCallback(
    viewId => {
      if (viewId) {
        const view = getViewById({ viewId, views });
        setView(view);
        const {
          options: { columnState, filterModel },
        } = view;
        updateGrid({ columnState, filterModel, viewId });
      }
    },
    [updateGrid, views]
  );

  const onFinish = async ({ name }) => {
    setIsSavingView(true);
    const {
      data: { id },
    } = await saveView({
      name,
      columnState: getColumnState(),
      filterModel: getFilterModel(),
      workspaceId,
      fieldSetId,
      userId,
    });
    message.info(`${name} is successfully created.`);

    const response = await fetchViews(workspaceId);
    setViews(response.data);
    const view = getViewById({ viewId: id, views: response.data });
    setView(view);
    setIsSavingView(false);
    setShowSaveAsPopover(false);
    const {
      options: { columnState, filterModel },
      id: viewId,
    } = view;
    updateGrid && updateGrid({ columnState, filterModel, viewId });
  };
  const getViewsForFieldSet = () => {
    return views.filter(({ options: { fieldSetId: id } }) => id === fieldSetId);
  };

  return (
    <Row gutter={5} wrap={false}>
      {!!views.length && (
        <>
          <Col flex="auto">
            <Select
              showSearch
              allowClear
              value={view?.name}
              onClear={() => {
                setView(null);
                resetGrid();
              }}
              placeholder="Select a view"
              optionFilterProp="children"
              onChange={onViewChange}
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
              style={{ width: '100%' }}
            >
              {getViewsForFieldSet().map(({ id, name }) => (
                <Option key={id} value={id}>
                  {name}
                </Option>
              ))}
            </Select>
          </Col>
          {!isViewerRole() && (
            <>
              <Col flex="35px">
                <Popconfirm
                  title={`Are you sure to delete ${view?.name}?`}
                  onConfirm={async () => {
                    const {
                      data: { id },
                    } = await deleteView(view.id);

                    message.info(
                      `${
                        getViewById({ viewId: id, views }).name
                      } is successfully deleted.`
                    );
                    const response = await fetchViews(workspaceId);
                    const responseViews = response.data;
                    setViews(responseViews);
                    if (responseViews?.length && updateGrid) {
                      const view = responseViews[0];
                      setView(view);
                      const {
                        options: { columnState, filterModel },
                        id,
                      } = view;
                      updateGrid({ columnState, filterModel, viewId: id });
                    } else {
                      setView(null);
                      resetGrid();
                    }
                  }}
                  okText="Yes"
                  cancelText="No"
                  placement="bottom"
                >
                  <Button
                    icon={<DeleteOutlined />}
                    disabled={!view}
                    size="middle"
                  />
                </Popconfirm>
              </Col>
              <Col flex="35px">
                <Button
                  icon={<SaveOutlined />}
                  size="middle"
                  disabled={!view}
                  loading={isUpdatingView}
                  onClick={async () => {
                    setIsUpdatingView(true);
                    const {
                      data: { id },
                    } = await updateView({
                      columnState: getColumnState(),
                      filterModel: getFilterModel(),
                      viewId: view.id,
                      viewName: view.name,
                      userId,
                      fieldSetId,
                      workspaceId,
                    });
                    setIsUpdatingView(false);
                    message.info(
                      `${
                        getViewById({ viewId: id, views }).name
                      } is successfully updated.`
                    );
                    const response = await fetchViews(workspaceId);
                    setViews(response.data);
                    setView(getViewById({ viewId: id, views: response.data }));
                  }}
                />
              </Col>
            </>
          )}
        </>
      )}
      {!isViewerRole() && (
        <Col flex="35px">
          <Popover
            content={() =>
              showSaveAsPopover ? (
                <Form name="save-view" layout="inline" onFinish={onFinish}>
                  <Form.Item
                    label="View Name"
                    name="name"
                    rules={[
                      { required: true, message: 'Please enter view name!' },
                    ]}
                  >
                    <Input placeholder="Enter view name" />
                  </Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isSavingView}
                  >
                    Create View
                  </Button>
                </Form>
              ) : null
            }
            trigger="click"
            placement="bottom"
            open={showSaveAsPopover}
            onOpenChange={visible => setShowSaveAsPopover(visible)}
          >
            <Tooltip
              title={
                view
                  ? 'Save as'
                  : 'Creates a new view with the current state of the grid.'
              }
            >
              <Button
                type="default"
                htmlType="button"
                icon={view ? <CopyOutlined /> : <PlusOutlined />}
              >
                {!views.length && 'Create View'}
              </Button>
            </Tooltip>
          </Popover>
        </Col>
      )}
    </Row>
  );
}
export default WorkspaceGridViewManager;
