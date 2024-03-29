import { Col, Row } from 'antd';
import FieldFilters from '../../../components/common/FieldFilters';
import CustomVisualizations from '../../../components/workspace/visualizations/Visualizations/CustomVisualizations';

export default function Trends({ workspaceId, fieldFilters }) {
  return (
    <Row gutter={[10, 10]}>
      <Col span={6}>
        <FieldFilters workspaceId={workspaceId} height="calc(100vh - 280px)" />
      </Col>
      <Col span={18}>
        <CustomVisualizations
          workspaceId={workspaceId}
          fieldFilters={fieldFilters}
        />
      </Col>
    </Row>
  );
}
