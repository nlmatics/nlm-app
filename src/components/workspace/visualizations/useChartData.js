import { useQuery } from 'react-query';
import { fetchFieldData } from '../fetcher';
import { chartTypes } from './utils';

export default function useChartData({
  rowGroupCols,
  filterModel = {},
  workspaceId,
  fieldBundleId,
  valueCols = [],
  groupKeys = [],
  chartType,
  fieldIds,
}) {
  const fieldId = rowGroupCols && rowGroupCols[groupKeys.length]?.id;

  const { data, error, isLoading, isError } = useQuery(
    ['nlm-chart-data', rowGroupCols, filterModel, valueCols, groupKeys],
    () =>
      fetchFieldData({
        workspaceId,
        fieldBundleId,
        ...(fieldIds
          ? { fieldIds }
          : { fieldIds: [...rowGroupCols, ...valueCols].map(({ id }) => id) }),
        gridQuery: {
          startRow: 0,
          rowGroupCols: chartType === chartTypes.WORD_CLOUD ? [] : rowGroupCols,
          valueCols,
          pivotCols: [],
          pivotMode: false,
          groupKeys,
          filterModel,
          sortModel: [],
        },
      }),
    {
      enabled: !!rowGroupCols.length && !!fieldId,
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
