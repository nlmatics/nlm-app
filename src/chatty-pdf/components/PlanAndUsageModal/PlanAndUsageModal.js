import { Modal } from 'antd';
import PlanAndUsage from '../../../pages/PlanAndUsage/PlanAndUsage';

export default function PlanAndUsageModal({ open, onClose, workspaceId }) {
  return (
    <Modal
      open={open}
      closable
      onCancel={onClose}
      footer={null}
      bodyStyle={{ padding: 0 }}
    >
      <PlanAndUsage workspaceId={workspaceId} />
    </Modal>
  );
}
