import { useQuery } from 'react-query';
import { fetchExtractionViews } from './fetcher';

const getQueryKey = workspaceId => ['nlm-extraction-views', workspaceId];

export default function useExtractionViews(workspaceId) {
  const { data, error, isLoading, isError, isIdle } = useQuery(
    getQueryKey(workspaceId),
    () => fetchExtractionViews(workspaceId),
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
