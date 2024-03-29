import { useQuery } from 'react-query';
import { fetchWorkspaceSearchPrompts } from './fetcher';

const getQueryKey = workspaceId => ['workspace-search-prompts', workspaceId];

export default function useWorkspaceSearchPrompts(workspaceId) {
  const { data, error, isLoading, isError, isIdle } = useQuery(
    getQueryKey(workspaceId),
    () => fetchWorkspaceSearchPrompts(workspaceId),
    {
      enabled: !!workspaceId,
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
