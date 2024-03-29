import { Spin } from 'antd';

export default function WorkspaceGridLoadingOverlay({ message }) {
  return (
    <div style={{ height: '100%', display: 'flex' }}>
      <Spin style={{ margin: 'auto' }} tip={message} />
    </div>
  );
}
