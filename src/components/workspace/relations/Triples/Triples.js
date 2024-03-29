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
import RelationRenderer from '../../../RelationRenderer';
import RelationTripleVisualizer from '../../../relationViz/RelationTripleVisualizer';

import './index.less';

export default function Triples({ triples, isFetching, workspaceId }) {
  let { url, path } = useRouteMatch();
  const [selectedRelation, setSelectedRelation] = useState(null);
  const history = useHistory();
  const { BRAND_COLOR } = useContext(ThemeContext);
  const getActions = item => {
    return [
      <EyeOutlined
        key={'view'}
        onClick={() => {
          setSelectedRelation(item);
          history.push(`${url}/${item.id}`);
        }}
      />,
      <EditOutlined
        onClick={() => {
          setSelectedRelation(item);
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
        {percentComplete === 100 ? (
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
    setSelectedRelation(null);
  };

  return (
    <>
      <Row>
        <Col
          span={selectedRelation ? 0 : 24}
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
                className="nlm-triples__new-triple"
                bordered={false}
              >
                <Button
                  size="large"
                  shape="circle"
                  type="primary"
                  title="Create new triple"
                  icon={<PlusOutlined></PlusOutlined>}
                  onClick={() => {
                    setSelectedRelation(true);
                    history.push(`${url}/new`);
                  }}
                ></Button>
              </Card>
            </Col>
            {(triples.length ? triples : [{}, {}, {}, {}, {}]).map(item => (
              <Col span={selectedRelation ? 24 : 4} key={item.id}>
                <Skeleton loading={isFetching} active paragraph={{ rows: 8 }}>
                  <Card
                    className="nlm-triples__triple"
                    size="small"
                    title={
                      <Typography.Title level={5} ellipsis>
                        {item.name}
                      </Typography.Title>
                    }
                    actions={getActions(item)}
                  >
                    {item.status && getProgress(item)}
                    <RelationRenderer
                      headTitle={
                        item.searchCriteria &&
                        item.searchCriteria.criterias[0].additionalQuestions &&
                        item.searchCriteria.criterias[0].additionalQuestions
                          .length > 0
                          ? item.searchCriteria.criterias[0]
                              .additionalQuestions[0]
                          : '-'
                      }
                      tailTitle={
                        item.searchCriteria &&
                        item.searchCriteria.criterias[0].additionalQuestions &&
                        item.searchCriteria.criterias[0].additionalQuestions
                          .length > 1
                          ? item.searchCriteria.criterias[0]
                              .additionalQuestions[1]
                          : '-'
                      }
                      relationTitle={
                        item.searchCriteria &&
                        item.searchCriteria.criterias[0].question
                      }
                    ></RelationRenderer>
                  </Card>
                </Skeleton>
              </Col>
            ))}
          </Row>
        </Col>
        <Col span={selectedRelation ? 24 : 0}>
          <Switch>
            <Route exact path={`${path}/new`}>
              <RelationEditor
                workspaceId={workspaceId}
                selectedRelation={null}
                relationType={'triple'}
                onEdited={() => {
                  setSelectedRelation(null);
                  history.push({
                    pathname: url,
                    state: { postNewOrEdit: true },
                  });
                }}
                onClose={onClose}
              ></RelationEditor>
            </Route>
            <Route exact path={`${path}/:relationId`}>
              {selectedRelation && (
                <RelationTripleVisualizer
                  selectedRelation={selectedRelation}
                  onClose={onClose}
                  onEdit={() => {
                    setSelectedRelation(selectedRelation);
                    history.push(`${url}/${selectedRelation.id}/edit`);
                  }}
                ></RelationTripleVisualizer>
              )}
            </Route>
            <Route exact path={`${path}/:relationId/edit`}>
              {selectedRelation && (
                <RelationEditor
                  workspaceId={workspaceId}
                  selectedRelation={selectedRelation}
                  relationType={'triple'}
                  onEdited={() => {
                    setSelectedRelation(null);
                    history.push({
                      pathname: url,
                      state: { postNewOrEdit: true },
                    });
                  }}
                  onVisualize={() => {
                    history.push(`${url}/${selectedRelation.id}`);
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
