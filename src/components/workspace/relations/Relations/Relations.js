import {
  ApartmentOutlined,
  GoldOutlined,
  RadarChartOutlined,
} from '@ant-design/icons';
import { Col, Menu, Row } from 'antd';
import { useState } from 'react';
import { Link, Route, Switch, useRouteMatch } from 'react-router-dom';
import SubMenuContainer from '../SubMenuContainer';

import './index.less';

export const RELATION_TYPES = {
  TRIPLE: 'triple',
  NODE: 'node',
  KNOWLEDGE_GRAPH: 'knowledge-graph',
};
export default function Relations({ workspaceId }) {
  let { url, path } = useRouteMatch();
  const [relationType, setRelationType] = useState('triple');
  // const [menuCollapsed, setMenuCollapsed] = useState();
  const [menuCollapsed] = useState(true);
  return (
    <Row gutter={[10, 10]} className="nlm-relations">
      <Col flex={menuCollapsed ? '32px' : '175px'}>
        <Menu
          mode="inline"
          selectedKeys={[relationType]}
          inlineCollapsed={menuCollapsed}
          items={[
            {
              key: 'triple',
              icon: <ApartmentOutlined />,
              label: <Link to={`${url}/type/triple`}>Triples</Link>,
            },
            {
              key: 'node',
              icon: <GoldOutlined />,
              label: <Link to={`${url}/type/node`}>Nodes</Link>,
            },
            {
              key: 'knowledge-graph',
              icon: <RadarChartOutlined />,
              label: (
                <Link to={`${url}/type/knowledge-graph`}>Knowledge Graph</Link>
              ),
            },
          ]}
        />
        {/* <Button
          onClick={() => setMenuCollapsed(!menuCollapsed)}
          style={{
            marginBottom: 16,
            width: menuCollapsed ? '50px' : '175px',
          }}
        >
          {menuCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </Button> */}
      </Col>
      <Col flex="auto" style={{ width: 'min-content' }}>
        <Switch>
          <Route path={`${path}/type/:relationType`}>
            <SubMenuContainer
              workspaceId={workspaceId}
              setRelationType={setRelationType}
              currentRelationType={relationType}
            />
          </Route>
        </Switch>
      </Col>
    </Row>
  );
}
