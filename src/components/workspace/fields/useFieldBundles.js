import { useQuery, useQueryClient } from 'react-query';
import { fetchFieldBundles } from '../fetcher';

const getQueryKey = workspaceId => ['field-bundles', workspaceId];
export default function useFieldBundles(workspaceId, isRestrictedWorkspace) {
  const { data, error, isLoading, isError, isIdle } = useQuery(
    getQueryKey(workspaceId),
    () => fetchFieldBundles(workspaceId),
    {
      enabled: !!workspaceId && !isRestrictedWorkspace,
    }
  );

  if (isError) {
    throw error;
  }

  const useRefetchFieldBundles = () => {
    const queryClient = useQueryClient();
    return workspaceId =>
      queryClient.invalidateQueries(getQueryKey(workspaceId));
  };

  return {
    data,
    isLoading: isLoading || isIdle,
    defaultFieldBundleId: data && data[0]?.id,
    useRefetchFieldBundles,
  };
}
