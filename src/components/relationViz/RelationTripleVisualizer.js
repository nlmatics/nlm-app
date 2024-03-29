import {
  ArrowRightOutlined,
  CloseOutlined,
  EditOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Layout,
  Row,
  Spin,
  Steps,
  Tabs,
  Typography,
} from 'antd';
import { useEffect, useRef, useState } from 'react';
import API from '../../utils/API';
import { showError } from '../../utils/apiCalls';
import { layouts, testData } from './config';
import RelationTripleMap from './RelationTripleMap';
import RelationTripleTable from './RelationTripleTable';
import { createGraph, createTree } from './utils';
const { Title } = Typography;
const { Step } = Steps;

const testMode = false;
export default function RelationTripleVisualizer({
  selectedRelation,
  onClose,
  onEdit,
}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  const graphRef = useRef(null);
  const graphMode = 'tree';
  const tabStyle = {
    width: 'calc(100vw - 167px)',
    height: 'calc(100vh - 275px)',
  };
  const tabBackgroundColor = {
    backgroundColor: 'white',
  };

  useEffect(() => {
    if (!graphRef.current) {
      if (graphMode === 'tree') {
        graphRef.current = createTree(
          ref,
          layouts.mindmap,
          selectedRelation.name
        );
      } else {
        graphRef.current = createGraph(ref, layouts.radialLayout);
      }
    }
  });

  useEffect(() => {
    console.debug('setting graph data to...', data, data.length);
    if (data.nodes || data.children) {
      graphRef.current.clear();
      graphRef.current.data(data);
      graphRef.current.render();
    }
  }, [data]);

  useEffect(() => {
    const fetchRelationGraph = async fieldId => {
      if (testMode) {
        if (graphMode == 'tree') {
          setData(testData.tree);
        } else {
          setData(testData.smallGraph);
        }
      } else {
        try {
          setLoading(true);
          console.debug('getting relation graph for field id: ', fieldId);
          let res = await API.get(`/fieldValue/relations/tree/${fieldId}`, {});
          if (res.data) {
            setData(res.data);
          }
        } catch (err) {
          showError(err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchRelationGraph(selectedRelation.id);
  }, [selectedRelation]);

  return (
    <Layout.Content>
      <Card size="small" style={{ marginBottom: 10 }}>
        <Row gutter={[10, 10]}>
          <Col span={6}>
            <Title level={5}>{selectedRelation?.name}</Title>
          </Col>
          <Col span={15}>
            {selectedRelation && (
              <Steps>
                <Step
                  status="finish"
                  icon={<MinusCircleOutlined />}
                  title={
                    selectedRelation.searchCriteria.criterias[0]
                      .additionalQuestions &&
                    selectedRelation.searchCriteria.criterias[0]
                      .additionalQuestions.length > 0
                      ? selectedRelation.searchCriteria.criterias[0]
                          .additionalQuestions[0]
                      : '-'
                  }
                />
                <Step
                  title={selectedRelation.searchCriteria.criterias[0].question}
                  status="finish"
                  icon={
                    <ArrowRightOutlined
                      style={{ fontSize: '16px', color: 'green' }}
                    />
                  }
                />
                <Step
                  status="finish"
                  icon={<MinusCircleOutlined />}
                  title={
                    selectedRelation.searchCriteria.criterias[0]
                      .additionalQuestions &&
                    selectedRelation.searchCriteria.criterias[0]
                      .additionalQuestions.length > 1
                      ? selectedRelation.searchCriteria.criterias[0]
                          .additionalQuestions[1]
                      : '-'
                  }
                />
              </Steps>
            )}
          </Col>
          <Col span={2} push={1}>
            <Button
              onClick={onEdit}
              icon={<EditOutlined />}
              type="default"
            ></Button>
          </Col>
          <Col span={1}>
            <Button icon={<CloseOutlined />} onClick={() => onClose()}></Button>
          </Col>
        </Row>
      </Card>
      <Card size="small" bodyStyle={{ paddingTop: 0 }}>
        <Spin spinning={loading}>
          <Tabs
            items={[
              {
                key: '0',
                label: 'Tree',
                children: (
                  <Row gutter={[8, 8]}>
                    <Col>
                      <div
                        style={{ ...tabStyle, ...tabBackgroundColor }}
                        ref={ref}
                      ></div>
                    </Col>
                  </Row>
                ),
              },
              {
                key: '1',
                label: 'Heatmap',
                children: (
                  <Row gutter={[8, 8]}>
                    <Col>
                      <div style={{ ...tabStyle, ...tabBackgroundColor }}>
                        <RelationTripleMap
                          selectedRelation={selectedRelation}
                          rows={[]}
                        ></RelationTripleMap>
                      </div>
                    </Col>
                  </Row>
                ),
              },
              {
                key: '2',
                label: 'Data',
                children: (
                  <Row gutter={[8, 8]}>
                    <Col style={tabStyle}>
                      <RelationTripleTable
                        selectedRelation={selectedRelation}
                        rows={[]}
                      ></RelationTripleTable>
                    </Col>
                  </Row>
                ),
              },
            ]}
          />
        </Spin>
      </Card>
    </Layout.Content>
  );
}
