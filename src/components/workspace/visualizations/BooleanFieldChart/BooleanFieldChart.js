import { Pie } from '@ant-design/plots';

export default function BooleanFieldChart({
  chartData,
  loading,
  setFilterValue,
}) {
  return (
    <Pie
      loading={loading}
      data={chartData}
      appendPadding={20}
      angleField="value"
      colorField="type"
      radius={0.75}
      label={{
        type: 'outer',
        labelHeight: 28,
        content: '{name}\n{percentage}',
      }}
      interactions={[
        {
          type: 'element-selected',
        },
        {
          type: 'element-active',
        },
      ]}
      legend={{
        layout: 'horizontal',
        position: 'bottom',
      }}
      onEvent={(pie, event) => {
        if (event.type === 'click' && event.data) {
          switch (event.data?.data?.type) {
            case '+':
              setFilterValue('');
              break;
            case '-':
              setFilterValue(null);
              break;
            default:
              setFilterValue(event.data?.data?.type);
          }
        }
      }}
    />
  );
}
