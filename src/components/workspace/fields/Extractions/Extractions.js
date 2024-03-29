import { Spin } from 'antd';
import { lazy, Suspense } from 'react';
const WorkspaceGrid = lazy(() => import('../../../WorkspaceGrid'));

export default function Extractions() {
  return (
    <Suspense fallback={<Spin />}>
      <WorkspaceGrid />
    </Suspense>
  );
}
