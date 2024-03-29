import { BuildOutlined } from '@ant-design/icons';
import {
  AutoComplete,
  Button,
  Card,
  Col,
  Drawer,
  InputNumber,
  Layout,
  List,
  Popconfirm,
  Row,
  Space,
  Spin,
  Typography,
} from 'antd';
import { lazy, Suspense, useContext, useEffect, useRef, useState } from 'react';
import API from '../../utils/API';
import { showError } from '../../utils/apiCalls';
import { goToFileSearch } from '../../utils/helpers';
import { WorkspaceContext } from '../WorkspaceContext';
import { layouts, testData } from './config';
import { createGraph } from './utils';
const SearchResultItem = lazy(() => import('../SearchResultItem'));
const { Title, Text } = Typography;

export default function KnowledgeGraphVisualizer({ workspaceId }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [matchingNodes, setMatchingNodes] = useState([]);
  const [edgeTopicFacts, setEdgeTopicFacts] = useState([]);
  const [selectedNode, setSelectedNode] = useState('');
  const [searchText, setSearchText] = useState('');
  const [depth, setDepth] = useState(2);
  const ref = useRef(null);
  const [searchExpansionVisible, setSearchExpansionVisible] = useState(false);
  const graphRef = useRef(null);
  const workspaceContext = useContext(WorkspaceContext);
  const drawerRef = useRef();
  const testMode = false;
  const tabStyle = {
    width: 'calc(100vw - 167px)',
    height: 'calc(100vh - 225px)',
    background: 'white',
  };

  const fetchKnowledgeGraph = async (workspaceId, depth, refresh) => {
    console.log(workspaceId);
    if (testMode) {
      testData.graph.nodes.forEach(node => {
        node.x = Math.random() * 1;
      });
      setData(testData.graph);
    } else {
      try {
        setLoading(true);
        console.log('getting relation graph for field id: ', workspaceId);
        let res = await API.get(
          `/fieldValue/relations/knowledgeGraph/${workspaceId}?selectedNode=${selectedNode}&depth=${depth}&refresh=${refresh}`,
          {}
        );
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

  const fetchEdgeTopicFacts = async (fieldId, relationHead, relationTail) => {
    try {
      setLoading(true);
      console.log(
        'getting edge details for: ',
        fieldId,
        relationHead,
        relationTail
      );
      let res = await API.get(
        `/fieldValue/relations/edgeTopicFacts/${fieldId}?relationHead=${relationHead}&relationTail=${relationTail}`,
        {}
      );
      console.log('got from server', res.data);
      setEdgeTopicFacts(res.data);
      setSearchExpansionVisible(true);
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  };

  const rebuildGraph = () => {
    fetchKnowledgeGraph(workspaceId, depth, true);
  };

  useEffect(() => {
    if (!graphRef.current) {
      graphRef.current = createGraph(ref, layouts.radialLayout);
      graphRef.current.on('edge:click', ev => {
        const edge = ev.item;
        const model = edge.getModel();
        console.log('clicked on edge: ', model);
        fetchEdgeTopicFacts(model.field_id, model.source, model.target);
      });
      console.log(fetchEdgeTopicFacts);
    }
  });

  useEffect(() => {
    console.log('setting graph data to...', data, data.length);
    if (data.nodes || data.children) {
      graphRef.current.clear();
      graphRef.current.on('afterlayout', () => {
        graphRef.current.fitView();
      });
      graphRef.current.data(data);
      graphRef.current.render();
      // graphRef.current.layout();
      // graphRef.current.layout();
      // graphRef.current.fitWindow();
    }
  }, [data]);

  useEffect(() => {
    if (workspaceId && selectedNode) {
      fetchKnowledgeGraph(workspaceId, depth, false);
    }
  }, [workspaceId, selectedNode, depth]);

  const fetchMatchingNodes = async searchText => {
    try {
      console.log('getting relation graph for field id: ', workspaceId);
      let res = await API.get(
        `/fieldValue/relations/autocomplete/${workspaceId}?searchText=${searchText}`,
        {}
      );
      if (res.data) {
        let matchingNodes = [];
        for (let row of res.data) {
          matchingNodes.push({ value: row });
        }
        setMatchingNodes(matchingNodes);
      }
    } catch (err) {
      showError(err);
    }
  };

  const onSearch = searchText => {
    if (searchText && searchText.length > 1) {
      fetchMatchingNodes(searchText);
    }
  };

  const onSelect = data => {
    setSelectedNode(data);
    console.log('onSelect', data);
  };

  const onChange = data => {
    console.log('onChange', data);
    setSearchText(data);
  };

  return (
    <Layout.Content>
      <Card size="small" style={{ marginBottom: 10 }}>
        <Row gutter={[10, 10]}>
          <Col span={6}>
            <Title level={5}>Knowledge Graph</Title>
          </Col>
          <Col span={14} align="left">
            <Space>
              <AutoComplete
                value={searchText}
                options={matchingNodes}
                style={{ width: 300 }}
                filterOption={false}
                allowClear={true}
                onSelect={onSelect}
                onSearch={onSearch}
                onChange={onChange}
                placeholder="Lookup node"
              />
              <Text>Depth:</Text>
              <InputNumber
                min={1}
                max={4}
                value={depth}
                onChange={val => setDepth(val)}
              />
            </Space>
          </Col>
          <Col span={4} align="right">
            <Popconfirm
              title="This is a long running operation. Are you sure you want to rebuild the graph?"
              onConfirm={() => rebuildGraph()}
            >
              <Button type="primary" icon={<BuildOutlined />}>
                Rebuild Graph
              </Button>
            </Popconfirm>
          </Col>
        </Row>
      </Card>
      <Card size="small" style={{ marginBottom: 10 }}>
        <Spin spinning={loading}>
          <div style={tabStyle} ref={ref}></div>
        </Spin>
      </Card>
      <Drawer
        className="nlm-drawer"
        width={'25vw'}
        placement={'right'}
        title={'Relation found in following passages:'}
        open={searchExpansionVisible}
        ref={drawerRef}
        onClose={() => setSearchExpansionVisible(false)}
      >
        <div ref={drawerRef}>
          <List
            itemLayout="horizontal"
            locale={{ emptyText: 'No items to show' }}
            dataSource={edgeTopicFacts}
            rowKey={searchResult => {
              return searchResult.unique_id;
            }}
            renderItem={searchResult => (
              <Suspense fallback={<Spin />}>
                <SearchResultItem
                  searchResult={searchResult}
                  answerLabel={null}
                  showResult={() => {
                    setLoading(true);
                    goToFileSearch(
                      null,
                      workspaceContext,
                      searchResult,
                      'relation'
                    );
                    setLoading(false);
                  }}
                  openFileLinkLabel={searchResult.file_name}
                  docActiveTabKey="search"
                  docId={searchResult?.file_idx}
                ></SearchResultItem>
              </Suspense>
            )}
          />
        </div>
      </Drawer>
    </Layout.Content>
  );
}
