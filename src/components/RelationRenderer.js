import { ArrowDownOutlined } from '@ant-design/icons';
import { Timeline, Typography } from 'antd';
const { Paragraph } = Typography;

const style = {
  marginBottom: 0,
};

export default function RelationRenderer({
  headTitle,
  tailTitle,
  relationTitle,
}) {
  return (
    <Timeline style={{ marginTop: '15px' }}>
      <Timeline.Item>
        <Paragraph style={style} ellipsis={{ rows: 2 }}>
          {headTitle}
        </Paragraph>
      </Timeline.Item>
      <Timeline.Item dot={<ArrowDownOutlined />}>
        <Paragraph style={style} ellipsis={{ rows: 2 }} italic>
          {relationTitle}
        </Paragraph>
      </Timeline.Item>
      <Timeline.Item style={{ paddingBottom: 0 }}>
        <Paragraph style={style} ellipsis={{ rows: 2 }}>
          {tailTitle}
        </Paragraph>
      </Timeline.Item>
    </Timeline>
  );
}
