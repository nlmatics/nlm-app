import { Col, Row } from 'antd';
import FieldFiltersProvider from '../../../contexts/fieldFilters/FieldFiltersProvider';
import EntitiesLegend from '../../common/EntitiesLegend';
import FieldFilters from '../../common/FieldFilters';
import WorkspaceSearch from '../../WorkspaceSearch';
import './index.less';

export default function WorkspaceSearchWithEntitiesLegend({ workspaceId }) {
  return (
    <FieldFiltersProvider>
      <div className="nlm-workspace-search-with-entities-legend">
        <Row className="nlm-workspaceSearch" gutter={[10, 10]}>
          <Col span={4}>
            <FieldFilters workspaceId={workspaceId} />
          </Col>
          <Col span={16}>
            <WorkspaceSearch workspaceId={workspaceId} mode="SEARCH" />
          </Col>
          <Col span={4} className="nlm-entities-legend">
            <EntitiesLegend />
          </Col>
        </Row>
      </div>
    </FieldFiltersProvider>
  );
}
