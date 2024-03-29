import { useQuery } from 'react-query';
import { fetchFieldData } from '../components/workspace/fetcher';

export default function useFilteredDocuments({
  filterModel,
  workspaceId,
  fieldBundleId,
  isRestrictedWorkspace,
}) {
  const { data, error, isLoading, isError } = useQuery(
    ['filtered-documents', workspaceId, fieldBundleId, filterModel],
    () =>
      fetchFieldData({
        workspaceId,
        fieldBundleId,
        fieldIds: [],
        gridQuery: {
          startRow: 0,
          filterModel,
          endRow: 50000,
        },
      }),
    {
      enabled:
        !!Object.keys(filterModel || {})?.length && !isRestrictedWorkspace,
    }
  );

  if (isError) {
    throw error;
  }

  return {
    data,
    isLoading: isLoading,
  };
}
