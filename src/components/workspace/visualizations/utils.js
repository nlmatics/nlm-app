import { dataTypes } from '../../../utils/constants';

export const chartTypes = {
  BOOLEAN: 'boolean',
  NUMERIC: 'numeric',
  AGGREGATE: 'aggregate',
  MULTILEVEL_GROUPING: 'multilevel-grouping',
  WORD_CLOUD: 'word-cloud',
};

export const getChartType = ({ dataType, rowGroupCols, valueCols }) => {
  let chartType;
  if (dataType === dataTypes.BOOLEAN) {
    chartType = chartTypes.BOOLEAN;
  }
  if (rowGroupCols?.length > 1) {
    chartType = chartTypes.MULTILEVEL_GROUPING;
  }
  if (rowGroupCols?.length === 1 && valueCols?.length) {
    chartType = chartTypes.AGGREGATE;
  }
  if (dataType === dataTypes.NUMBER || dataType === dataTypes.MONEY) {
    chartType = chartTypes.NUMERIC;
  }
  if (dataType === dataTypes.TEXT) {
    chartType = chartTypes.WORD_CLOUD;
  }
  return chartType;
};
