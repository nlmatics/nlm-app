import { Typography } from 'antd';
import { countBy } from 'lodash';
import { useEffect, useState, memo } from 'react';
import AggregateFieldChart from '../../AggregateFieldChart';
import NumericFieldChart from '../../NumericFieldChart/NumericFieldChart';
import BooleanFieldChart from '../../BooleanFieldChart';
import useChartData from '../../useChartData';
import { chartTypes } from '../../utils';
import numeral from 'numeral';
import MultilevelGroupingChart from '../../MultilevelGroupingChart/MultilevelGroupingChart';
import WordCloudChart from '../../WordCloudChart';
export default memo(function Visualization({
  height,
  workspaceId,
  rowGroupCols,
  filterModel,
  fieldBundleId,
  valueCols,
  isExpanded,
  chartType,
  allFields,
  setFilterConfig,
  fieldIds,
}) {
  const [chartData, setChartData] = useState([]);
  const [groupKeys, setGroupKeys] = useState([]);

  const getFieldNames = (rowGroupCols = []) => {
    return rowGroupCols.flatMap(({ id: groupedColId }) => {
      return (
        (allFields || [])?.find(({ id }) => id === groupedColId)?.name || []
      );
    });
  };
  const fieldNames = getFieldNames(rowGroupCols);

  const { data, isLoading } = useChartData({
    rowGroupCols,
    fieldBundleId,
    filterModel,
    workspaceId,
    valueCols,
    groupKeys,
    chartType,
    fieldIds,
  });

  useEffect(() => {
    const getAggregateFieldChartData = data => {
      const fieldId = rowGroupCols && rowGroupCols[groupKeys.length]?.id;

      const columnChartData = valueCols?.flatMap(
        ({ aggFunc, displayName: fieldName, field: colId }) => {
          return data?.map(result => ({
            groupFieldValue: result[fieldId].answer_details.raw_value,
            aggField: `${aggFunc}(${fieldName})`,
            value: result[colId].answer_details.raw_value,
          }));
        }
      );
      return data ? columnChartData : [];
    };

    const getValue = rawValue => {
      let value = rawValue;
      if (rawValue === null) {
        value = '-';
      }
      if (rawValue === '') {
        value = '+';
      }
      return value;
    };

    const getBooleanFieldChartData = data => {
      const fieldId = rowGroupCols && rowGroupCols[groupKeys.length]?.id;
      return data?.map(d => {
        return {
          type: getValue(d[fieldId].answer_details.raw_value),
          value: d.child_total,
        };
      });
    };

    const getMultilevelGroupingChartData = data => {
      const fieldId = rowGroupCols && rowGroupCols[groupKeys.length]?.id;
      const totalCount = data
        ?.map(({ child_total }) => child_total)
        .reduce(function (a, b) {
          return a + b;
        }, 0);
      return data?.map(d => {
        return {
          label: `${getValue(d[fieldId].answer_details.raw_value)} (${numeral(
            d.child_total / totalCount
          ).format('O%')})`,
          value: d.child_total,
        };
      });
    };

    const getNumericFieldChartData = data => {
      const fieldId = rowGroupCols && rowGroupCols[groupKeys.length]?.id;

      return data?.map(
        ({
          [fieldId]: {
            answer_details: {
              raw_value: { min, max },
            },
          },
          child_total,
        }) => ({
          label: `${numeral(min).format('Oa')} - ${numeral(max).format('Oa')}`,
          value: child_total,
        })
      );
    };

    const getWordCloudChartData = data => {
      const fieldId = rowGroupCols && rowGroupCols[groupKeys.length]?.id;
      const answers = data?.flatMap(
        ({ [fieldId]: { answer, answer_details } }) =>
          answer || answer_details?.formatted_value
            ? [answer || answer_details?.formatted_value]
            : []
      );
      const groupedByCount = countBy(answers);
      return Object.keys(groupedByCount).map(key => ({
        name: key,
        value: groupedByCount[key],
      }));
    };

    if (!isLoading && data?.results.length) {
      let parsedData;

      if (chartType === chartTypes.BOOLEAN) {
        parsedData = getBooleanFieldChartData(data?.results);
      }
      if (chartType === chartTypes.MULTILEVEL_GROUPING) {
        parsedData = getMultilevelGroupingChartData(data?.results);
      }
      if (chartType === chartTypes.AGGREGATE) {
        parsedData = getAggregateFieldChartData(data?.results);
      }
      if (chartType === chartTypes.NUMERIC) {
        parsedData = getNumericFieldChartData(data?.results);
      }
      if (chartType === chartTypes.WORD_CLOUD) {
        parsedData = getWordCloudChartData(data?.results);
      }
      if (groupKeys.length) {
        setChartData(chartData =>
          chartData.map(({ label, value, children }) => {
            if (label.split(' ')[0] === groupKeys[0]) {
              return { label, value, children: parsedData };
            } else {
              return { label, value, children };
            }
          })
        );
      } else {
        setChartData(parsedData);
      }
    }
  }, [isLoading, data, groupKeys, valueCols, rowGroupCols, chartType]);

  const fieldNamesLabel = fieldNames.join(' > ');

  const getChartByType = chartType => {
    let chart;
    switch (chartType) {
      case chartTypes.BOOLEAN:
        chart = (
          <BooleanFieldChart
            chartData={chartData}
            loading={isLoading}
            setFilterValue={value =>
              setFilterConfig({ fieldId: rowGroupCols[0].id, value })
            }
          />
        );
        break;
      case chartTypes.AGGREGATE:
        chart = (
          <AggregateFieldChart chartData={chartData} loading={isLoading} />
        );
        break;

      case chartTypes.NUMERIC:
        chart = (
          <NumericFieldChart
            chartData={chartData}
            loading={isLoading}
            setFilterValue={({ valueFrom, valueTo }) =>
              setFilterConfig({
                fieldId: rowGroupCols[0].id,
                valueFrom,
                valueTo,
              })
            }
          />
        );
        break;

      case chartTypes.MULTILEVEL_GROUPING:
        chart = (
          <MultilevelGroupingChart
            chartData={chartData}
            loading={isLoading}
            setGroupKey={setGroupKeys}
          />
        );
        break;

      case chartTypes.WORD_CLOUD:
        chart = <WordCloudChart chartData={chartData} />;
        break;

      default:
        chart = null;
        break;
    }
    return chart;
  };
  return (
    <div
      style={{
        height: isExpanded ? 'calc(100vh - 250px)' : height,
        marginTop: 10,
      }}
    >
      {!!chartData.length && getChartByType(chartType)}
      <Typography.Text
        title={fieldNamesLabel}
        ellipsis
        style={{ marginTop: 5, textAlign: 'center', width: '100%' }}
      >
        {fieldNamesLabel}
      </Typography.Text>
    </div>
  );
});
