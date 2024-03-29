import { Modal, Spin } from 'antd';
import { lazy, Suspense } from 'react';
const WorkspaceGrid = lazy(() => import('./WorkspaceGrid'));

const WorkspaceGridFieldContextModal = ({ fieldId, fieldName, hideModal }) => {
  return (
    <Modal
      title={fieldName}
      open
      onCancel={hideModal}
      footer={null}
      width="calc(100vw - 80px)"
      style={{
        top: 68,
        left: 66,
        margin: 'inherit',
        padding: 0,
      }}
    >
      <Suspense fallback={<Spin />}>
        <WorkspaceGrid showOnlyFieldId={fieldId} expandedView />
      </Suspense>
    </Modal>
  );
};

export default WorkspaceGridFieldContextModal;
