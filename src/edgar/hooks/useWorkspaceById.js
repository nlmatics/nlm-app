import { useQuery } from 'react-query';
import { fetchWorkspaceById } from './fetcher';

const getQueryKey = workspaceId => ['workspace', workspaceId];

export default function useWorkspaceById(workspaceId, isRestrictedWorkspace) {
  const { data, error, isLoading, isError, isIdle } = useQuery(
    getQueryKey(workspaceId),
    () => fetchWorkspaceById(workspaceId),
    {
      enabled: !!workspaceId && !isRestrictedWorkspace,
    }
  );

  if (isError) {
    throw error;
  }

  return {
    data,
    isLoading: isLoading || isIdle,
  };
}
