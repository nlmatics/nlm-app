import { WordCloud } from '@ant-design/plots';
import { useContext } from 'react';
import ThemeContext from '../../../../contexts/theme/ThemContext';

export default function WordCloudChart({ chartData }) {
  const { BRAND_COLOR } = useContext(ThemeContext);
  return (
    <WordCloud
      wordField="name"
      weightField="value"
      data={chartData}
      colorField="name"
      color={BRAND_COLOR}
      wordStyle={{
        fontSize: [10, 25],
        rotation: 0,
      }}
      random={() => 0.5}
    />
  );
}
