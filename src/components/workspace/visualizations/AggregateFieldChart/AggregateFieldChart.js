import { Column } from '@ant-design/charts';
import numeral from 'numeral';

export default function AggregateFieldChart({ chartData, loading }) {
  return (
    <Column
      loading={loading}
      height={2000}
      data={chartData}
      xField="groupFieldValue"
      yField="value"
      seriesField="aggField"
      isGroup="true"
      columnStyle={{
        radius: [20, 20, 0, 0],
      }}
      xAxis={{
        label: {
          autoHide: false,
          autoRotate: true,
        },
      }}
      yAxis={{
        label: {
          autoHide: false,
          autoRotate: true,
          formatter: label => numeral(label).format('Oa'),
        },
      }}
      tooltip={{
        formatter: datum => {
          return {
            ...datum,
            name: datum.aggField,
            value: numeral(datum.value).format('($ 0.00 a)'),
          };
        },
      }}
    />
  );
}
