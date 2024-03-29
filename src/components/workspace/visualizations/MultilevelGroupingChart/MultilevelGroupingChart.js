import { Sunburst } from '@ant-design/charts';

export default function MultilevelGroupingChart({
  chartData,
  loading,
  setGroupKey,
}) {
  return (
    <Sunburst
      loading={loading}
      data={{ label: 'Data', children: chartData }}
      innerRadius={0.2}
      height={2000}
      colorField="label"
      hierarchyConfig={{
        field: 'value',
      }}
      label={{
        layout: [{ type: 'limit-in-shape' }],
      }}
      interactions={[{ type: 'element-active' }]}
      onEvent={(chart, event) => {
        if (event.type === 'click' && event.data) {
          setGroupKey(
            event.data?.data?.path.split(' / ').map(path => path.split(' ')[0])
          );
        }
      }}
    />
  );
}
