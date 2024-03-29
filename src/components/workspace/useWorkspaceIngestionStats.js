import { useQuery, useQueryClient } from 'react-query';
import { fetchWorkspaceIngestionStats } from './fetcher';

const getQueryKey = workspaceId => ['workspace-ingestion-stats', workspaceId];

export default function useWorkspaceIngestionStats(workspaceId) {
  const { data, error, isLoading, isError, isIdle } = useQuery(
    getQueryKey(workspaceId),
    () => fetchWorkspaceIngestionStats(workspaceId),
    {
      enabled: !!workspaceId,
    }
  );

  if (isError) {
    throw error;
  }

  const useRefetchWorkspaceIngestionStats = () => {
    const queryClient = useQueryClient();
    return workspaceId =>
      queryClient.invalidateQueries(getQueryKey(workspaceId));
  };

  return {
    data,
    isLoading: isLoading || isIdle,
    useRefetchWorkspaceIngestionStats,
  };
}
