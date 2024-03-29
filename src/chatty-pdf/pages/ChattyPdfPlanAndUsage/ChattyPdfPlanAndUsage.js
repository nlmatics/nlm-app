import { Col, Layout, Row } from 'antd';
import PlanAndUsage from '../../../pages/PlanAndUsage/PlanAndUsage';
import AppHeader from '../../components/AppHeader/AppHeader';

export default function ChattyPdfPlanAndUsage() {
  return (
    <Layout.Content style={{ padding: 20 }}>
      <AppHeader />
      <Row justify="center">
        <Col xs={{ span: 24 }} lg={{ span: 20 }}>
          <PlanAndUsage />
        </Col>
      </Row>
    </Layout.Content>
  );
}
