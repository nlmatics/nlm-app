import {
  CheckCircleOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Progress,
  Row,
  Skeleton,
  Tooltip,
  Typography,
} from 'antd';
import { useContext, useState } from 'react';
import { Route, Switch, useHistory, useRouteMatch } from 'react-router-dom';
import ThemeContext from '../../../../contexts/theme/ThemContext';
import RelationEditor from '../../../RelationEditor';
import RelationNodeVisualizer from '../../../relationViz/RelationNodeVisualizer';

import './index.less';

const { Title } = Typography;
export default function Nodes({ nodes, isFetching, workspaceId }) {
  let { url, path } = useRouteMatch();
  const history = useHistory();
  const [selectedNode, setSelectedNode] = useState(null);
  const { BRAND_COLOR } = useContext(ThemeContext);
  const getActions = item => {
    return [
      <EyeOutlined
        key={'view'}
        onClick={() => {
          setSelectedNode(item);
          history.push(`${url}/${item.id}`);
        }}
      />,
      <EditOutlined
        onClick={() => {
          setSelectedNode(item);
          history.push(`${url}/${item.id}/edit`);
        }}
        key="refine"
      />,
    ];
  };

  const getProgress = item => {
    let percentComplete = Math.round(
      ((item.status.done + 1) * 100) / (item.status.total + 1)
    );
    return (
      <Tooltip
        title={
          item.status.done && item.status.total
            ? `${item.status.done}/${item.status.total} extracted`
            : ''
        }
      >
        {percentComplete >= 100 ? (
          <div style={{ textAlign: 'center' }}>
            <CheckCircleOutlined
              style={{
                color: 'green',

                fontSize: 20,
              }}
            />
          </div>
        ) : (
          <Progress
            status="active"
            percent={percentComplete}
            type="line"
            strokeWidth={3}
            strokeColor={BRAND_COLOR}
          />
        )}
      </Tooltip>
    );
  };

  const onClose = () => {
    history.push(url);
    setSelectedNode(null);
  };

  return (
    <>
      <Row>
        <Col
          span={selectedNode ? 0 : 24}
          style={{
            height: 'calc(100vh - 185px)',
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          <Row gutter={[10, 10]}>
            <Col span={4}>
              <Card
                size="small"
                className="nlm-nodes__new-node"
                bordered={false}
              >
                <Button
                  size="large"
                  shape="circle"
                  type="primary"
                  title="Create new node"
                  icon={<PlusOutlined></PlusOutlined>}
                  onClick={() => {
                    setSelectedNode(true);
                    history.push(`${url}/new`);
                  }}
                ></Button>
              </Card>
            </Col>
            {(nodes.length ? nodes : [{}, {}, {}, {}, {}]).map(item => (
              <Col span={selectedNode ? 24 : 4} key={item.id}>
                <Skeleton loading={isFetching} active paragraph={{ rows: 5 }}>
                  <Card
                    size="small"
                    className="nlm-nodes__node"
                    title={<Title level={5}>{item.name}</Title>}
                    actions={getActions(item)}
                  >
                    {item?.status && getProgress(item)}
                    {item.searchCriteria &&
                      item.searchCriteria.criterias[0].question}
                  </Card>
                </Skeleton>
              </Col>
            ))}
          </Row>
        </Col>
        <Col span={selectedNode ? 24 : 0}>
          <Switch>
            <Route exact path={`${path}/new`}>
              <RelationEditor
                workspaceId={workspaceId}
                selectedRelation={null}
                relationType={'node'}
                onEdited={() => {
                  setSelectedNode(null);
                  history.push({
                    pathname: url,
                    state: { postNewOrEdit: true },
                  });
                }}
                onClose={onClose}
              ></RelationEditor>
            </Route>
            <Route exact path={`${path}/:nodeId`}>
              {selectedNode && (
                <RelationNodeVisualizer
                  selectedNode={selectedNode}
                  onClose={onClose}
                  onEdit={() => {
                    setSelectedNode(selectedNode);
                    history.push(`${url}/${selectedNode.id}/edit`);
                  }}
                ></RelationNodeVisualizer>
              )}
            </Route>
            <Route exact path={`${path}/:nodeId/edit`}>
              {selectedNode && (
                <RelationEditor
                  workspaceId={workspaceId}
                  selectedRelation={selectedNode}
                  relationType={'node'}
                  onEdited={() => {
                    setSelectedNode(null);
                    history.push({
                      pathname: url,
                      state: { postNewOrEdit: true },
                    });
                  }}
                  onVisualize={() => {
                    history.push(`${url}/${selectedNode.id}`);
                  }}
                  onClose={onClose}
                ></RelationEditor>
              )}
            </Route>
          </Switch>
        </Col>
      </Row>
    </>
  );
}
