import { Column } from '@ant-design/charts';
import numeral from 'numeral';

export default function NumericFieldChart({
  chartData,
  loading,
  setFilterValue,
}) {
  return (
    <Column
      loading={loading}
      height={2000}
      data={chartData}
      xField="label"
      yField="value"
      label={{
        position: 'bottom',
        style: {
          fill: '#FFFFFF',
          opacity: 0.6,
        },
      }}
      xAxis={{
        label: {
          autoHide: false,
          autoRotate: true,
        },
      }}
      onEvent={(chart, event) => {
        if (event.type === 'click' && event.data) {
          const [from, to] = event.data?.data?.label.split(' - ');
          setFilterValue({
            valueFrom: numeral(from).value(),
            valueTo: numeral(to).value(),
          });
        }
      }}
    />
  );
}
