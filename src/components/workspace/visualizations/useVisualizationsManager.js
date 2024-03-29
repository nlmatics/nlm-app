import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  deleteVisualization,
  fetchVisualizations,
  saveVisualization,
} from './fetcher';

const getQueryKey = workspaceId => ['nlm-visualizations', workspaceId];

const useVisualizations = ({ workspaceId }) => {
  const { data, error, isLoading, isError, isIdle } = useQuery(
    getQueryKey(workspaceId),
    () => fetchVisualizations(workspaceId)
  );

  if (isError) {
    throw error;
  }

  return {
    data,
    isLoading: isLoading || isIdle,
  };
};

const useSaveVisualization = workspaceId => {
  const queryClient = useQueryClient();

  return useMutation(
    ({
      name,
      rowGroupCols,
      filterModel,
      workspaceId,
      fieldSetId,
      userId,
      valueCols,
      chartType,
    }) =>
      saveVisualization({
        name,
        rowGroupCols,
        filterModel,
        workspaceId,
        fieldSetId,
        userId,
        valueCols,
        chartType,
      }),
    {
      onSuccess: () => {
        queryClient.refetchQueries({ queryKey: getQueryKey(workspaceId) });
      },
    }
  );
};

const useDeleteVisualization = workspaceId => {
  const queryClient = useQueryClient();

  return useMutation(visualizationId => deleteVisualization(visualizationId), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getQueryKey(workspaceId) });
    },
  });
};

export default function useVisualizationsManager() {
  return {
    useVisualizations,
    useSaveVisualization,
    useDeleteVisualization,
  };
}
