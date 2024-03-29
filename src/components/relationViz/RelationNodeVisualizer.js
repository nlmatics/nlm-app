import { CloseOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Card, Col, Layout, Row, Spin, Tabs, Typography } from 'antd';
import { useEffect, useRef, useState } from 'react';
import API from '../../utils/API';
import { showError } from '../../utils/apiCalls';
import { layouts, testData } from './config';
import RelationNodeTable from './RelationNodeTable';
import { createGraph, createTree } from './utils';
const { Title } = Typography;

export default function RelationNodeVisualizer({
  selectedNode,
  onClose,
  onEdit,
}) {
  const [data, setData] = useState([]);
  const [tableRows, setTableRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  const graphRef = useRef(null);
  const testMode = false;
  const graphMode = 'graph';
  const tabStyle = {
    width: 'calc(100vw - 167px)',
    height: 'calc(100vh - 275px)',
  };
  const tabBackgroundColor = {
    backgroundColor: 'white',
  };
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
        let res = await API.get(`/fieldValue/relations/graph/${fieldId}`, {});
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

  useEffect(() => {
    if (!graphRef.current) {
      if (graphMode === 'tree') {
        graphRef.current = createTree(ref, layouts.mindmap, selectedNode.name);
      } else {
        graphRef.current = createGraph(ref, layouts.forceLayout);
      }
    }
  });

  useEffect(() => {
    console.debug('setting graph data to...', data, data.length);
    if (data.nodes || data.children) {
      graphRef.current.clear();
      graphRef.current.data(data);
      graphRef.current.render();
      setTableRows(data.nodes);
    }
  }, [data]);

  useEffect(() => {
    fetchRelationGraph(selectedNode.id);
  }, [selectedNode]);

  return (
    <Layout.Content>
      <Card size="small" style={{ marginBottom: 10 }}>
        <Row gutter={[10, 10]}>
          <Col span={6}>
            <Title level={5}>{selectedNode?.name}</Title>
          </Col>
          <Col span={15}></Col>
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
                label: 'Summary',
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
                key: '2',
                label: 'Data',
                children: (
                  <Row gutter={[8, 8]}>
                    <Col style={tabStyle}>
                      <RelationNodeTable
                        selectedRelation={selectedNode}
                        rows={tableRows}
                      ></RelationNodeTable>
                    </Col>
                  </Row>
                ),
              },
            ]}
          ></Tabs>
        </Spin>
      </Card>
    </Layout.Content>
  );
}
