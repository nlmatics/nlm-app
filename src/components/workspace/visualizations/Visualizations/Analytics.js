import {
  BarChartOutlined,
  DatabaseOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { Button, Col, Menu, Row } from 'antd';
import { useState } from 'react';
import { Link, Route, Switch, useRouteMatch } from 'react-router-dom';
import CustomVisualizations from './CustomVisualizations';
import FieldVisualizations from './FieldVisualizations';

export default function Analytics({ workspaceId }) {
  const [activeMenuKey, setActiveMenuKey] = useState('fields');
  const { url, path } = useRouteMatch();
  const [menuCollapsed, setMenuCollapsed] = useState(true);

  return (
    <>
      <Row
        gutter={[10, 10]}
        className="nlm-fields-and-extractions"
        wrap={false}
      >
        <Col flex={menuCollapsed ? '40px' : '150px'}>
          <Menu
            mode="inline"
            selectedKeys={[activeMenuKey]}
            inlineCollapsed={menuCollapsed}
            onSelect={({ key }) => setActiveMenuKey(key)}
            items={[
              {
                key: 'fields',
                icon: <DatabaseOutlined />,
                label: <Link to={`${url}/fields`}>Data Fields</Link>,
              },
              {
                key: 'custom',
                icon: <BarChartOutlined />,
                label: <Link to={`${url}/custom`}>Custom</Link>,
              },
            ]}
          ></Menu>
          <Button
            onClick={() => setMenuCollapsed(!menuCollapsed)}
            style={{
              padding: 0,
              width: menuCollapsed ? '32px' : '140px',
            }}
          >
            {menuCollapsed ? <RightOutlined /> : <LeftOutlined />}
          </Button>
        </Col>
        <Col flex="auto">
          <Switch>
            <Route path={`${path}/fields`}>
              <FieldVisualizations workspaceId={workspaceId} />
            </Route>
            <Route path={`${path}/custom`}>
              <CustomVisualizations workspaceId={workspaceId} />
            </Route>
          </Switch>
        </Col>
      </Row>
    </>
  );
}
