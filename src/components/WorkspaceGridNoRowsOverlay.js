import { Result } from 'antd';

export default function WorkspaceGridNoRowsOverlay({ isFilterApplied }) {
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {isFilterApplied ? (
        <Result
          style={{ margin: 'auto' }}
          title="No rows found"
          extra="Refine filters"
        />
      ) : (
        <Result title="No documents in the workspace." />
      )}
    </div>
  );
}
