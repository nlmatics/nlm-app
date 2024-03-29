import { useCallback } from 'react';
import { useQuery } from 'react-query';
import { fetchViews } from './fetcher';

const getQueryKey = userId => ['views', userId];

export default function useViews(workspaceId) {
  const { data, error, isLoading, isError, isIdle } = useQuery(
    getQueryKey(workspaceId),
    () => fetchViews(workspaceId),
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
    getViews: useCallback(() => {
      return data?.filter(
        ({ options: { isVisualization } }) => !isVisualization
      );
    }, [data]),
    getViewById: ({ viewId }) =>
      data
        ?.filter(({ options: { isVisualization } }) => !isVisualization)
        ?.find(({ id }) => id === viewId),
  };
}
