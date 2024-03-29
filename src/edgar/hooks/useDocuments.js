import { useQuery } from 'react-query';
import { fetchDocumentsById } from './fetcher';

const getQueryKey = workspaceId => ['documents', workspaceId];

export default function useDocuments(workspaceId, isRestrictedWorkspace) {
  const { data, error, isLoading, isError, isIdle } = useQuery(
    getQueryKey(workspaceId),
    () => fetchDocumentsById(workspaceId),
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
