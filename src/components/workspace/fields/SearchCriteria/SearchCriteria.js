import { Layout } from 'antd';
import { useParams } from 'react-router-dom';
import WorkspaceSearch from '../../../WorkspaceSearch';

export default function SearchCriteria() {
  const { workspaceId } = useParams();
  return (
    <Layout
      style={{
        height: 'calc(100vh - 175px)',
      }}
    >
      <WorkspaceSearch workspaceId={workspaceId} mode="EXTRACT" />
    </Layout>
  );
}
