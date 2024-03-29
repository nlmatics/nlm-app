import {
  DatabaseOutlined,
  GroupOutlined,
  LeftOutlined,
  RightOutlined,
  SubnodeOutlined,
  TableOutlined,
} from '@ant-design/icons';
import { Button, Col, Menu, Row } from 'antd';
import { useEffect, useState } from 'react';
import {
  Link,
  Route,
  Switch,
  useParams,
  useRouteMatch,
} from 'react-router-dom';
import Extractions from '../Extractions';
import ExtractionsRouteComponent from './ExtractionsRouteComponent';

import './index.less';

const validKeys = ['data', 'dataFields', 'workflowFields'];

export default function FieldsAndExtractions({
  workspaceId,
  setLatestExtractionsMenuKey,
}) {
  const { activeMenuKey } = useParams();
  const { url, path } = useRouteMatch();
  const [extractionsMenuKey, setExtractionsMenuKey] = useState('data');
  const [menuCollapsed, setMenuCollapsed] = useState(true);

  useEffect(() => {
    if (
      // Do only for Extractions Menu
      activeMenuKey === 'extractions' &&
      // Handling Document route conflict
      validKeys.includes(extractionsMenuKey)
    ) {
      const pathSuffix = extractionsMenuKey === 'data' ? '' : '/all';
      setLatestExtractionsMenuKey(`${extractionsMenuKey}${pathSuffix}`);
    }
  }, [extractionsMenuKey, setLatestExtractionsMenuKey, activeMenuKey]);

  return (
    <>
      <Row
        gutter={[10, 10]}
        className="nlm-fields-and-extractions"
        wrap={false}
      >
        <Col flex={menuCollapsed ? '37px' : '145px'}>
          <Menu
            mode="inline"
            selectedKeys={[extractionsMenuKey]}
            inlineCollapsed={menuCollapsed}
            items={[
              {
                key: 'data',
                icon: <TableOutlined />,
                label: <Link to={`${url}/data`}>Data</Link>,
              },
              {
                key: 'dataFields',
                icon: <DatabaseOutlined />,
                label: <Link to={`${url}/dataFields/all`}>Data Fields</Link>,
              },
              {
                key: 'workflowFields',
                icon: <GroupOutlined />,
                label: (
                  <Link to={`${url}/workflowFields/all`}>Workflow Fields</Link>
                ),
              },
              {
                key: 'derivedFields',
                icon: <SubnodeOutlined />,
                label: (
                  <Link to={`${url}/derivedFields/all`}>Derived Fields</Link>
                ),
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
        {/* This is a workaround to avoid unmounting of Extractions i.e. Data Grid */}
        <Col
          flex="auto"
          style={{
            width: 'min-content',
            display: extractionsMenuKey === 'data' ? 'block' : 'none',
          }}
        >
          <Extractions />
        </Col>
        <Col
          flex="auto"
          style={{
            width: 'min-content',
            display: extractionsMenuKey === 'data' ? 'none' : 'block',
          }}
        >
          <Switch>
            <Route path={`${path}/:extractionsMenuKey`}>
              <ExtractionsRouteComponent
                currentExtractionsMenuKey={extractionsMenuKey}
                workspaceId={workspaceId}
                setExtractionsMenuKey={setExtractionsMenuKey}
              />
            </Route>
          </Switch>
        </Col>
      </Row>
    </>
  );
}
