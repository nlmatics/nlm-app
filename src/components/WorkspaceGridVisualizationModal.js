import { Button, Form, Input, message, Modal } from 'antd';
import { useState } from 'react';
import useVisualizationsManager from './workspace/visualizations/useVisualizationsManager';
import Visualization from './workspace/visualizations/Visualizations/Visualization/Visualization';

const WorkspaceGridVisualizationModal = ({
  rowGroupCols,
  fieldBundleId,
  filterModel,
  workspaceId,
  hideModal,
  userId,
  fieldName,
  valueCols,
  chartType,
  viewOnly,
}) => {
  const [confirmLoading, setConfirmLoading] = useState(false);
  const { useSaveVisualization } = useVisualizationsManager();
  const saveVisualizationMutation = useSaveVisualization(workspaceId);

  const onFinish = async ({ visualizationName }) => {
    setConfirmLoading(true);
    await saveVisualizationMutation.mutateAsync({
      name: visualizationName,
      rowGroupCols,
      filterModel,
      workspaceId,
      fieldSetId: fieldBundleId,
      userId,
      valueCols,
      chartType,
    });
    setConfirmLoading(false);
    message.success('Custom chart saved successfully.');
    hideModal();
  };

  return (
    <Modal
      title={viewOnly ? fieldName : 'Analyze'}
      open
      onCancel={hideModal}
      bodyStyle={{ height: '60vh' }}
      footer={
        viewOnly ? null : (
          <>
            <Button
              type="primary"
              form="save-visualization"
              htmlType="submit"
              loading={confirmLoading}
            >
              Save
            </Button>
            <Button htmlType="button" onClick={hideModal}>
              Cancel
            </Button>
          </>
        )
      }
      confirmLoading={confirmLoading}
    >
      <Visualization
        height="calc(60vh - 80px)"
        rowGroupCols={rowGroupCols}
        fieldBundleId={fieldBundleId}
        valueCols={valueCols}
        filterModel={filterModel}
        workspaceId={workspaceId}
        chartType={chartType}
      />
      {!viewOnly && (
        <Form
          name="save-visualization"
          onFinish={onFinish}
          style={{ marginTop: 10 }}
        >
          <Form.Item
            initialValue={fieldName}
            label="Visualization Name"
            name="visualizationName"
            rules={[
              { required: true, message: 'Please enter visualization name!' },
            ]}
          >
            <Input autoFocus />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default WorkspaceGridVisualizationModal;
