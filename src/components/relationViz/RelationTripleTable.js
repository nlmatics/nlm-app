import { Table, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { showError } from '../../utils/apiCalls';
import API from '../../utils/API';

export default function RelationTripleTable({ selectedRelation }) {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [sourceTexts, setSourceTexts] = useState(new Set());
  const [targetTexts, setTargetTexts] = useState(new Set());
  const [scrollPosition] = useState('calc(100vh - 380px)');
  const columns = [
    {
      title: 'Source',
      dataIndex: 'source',
      key: 'source',
      filterSearch: true,
      filters: Array.from(sourceTexts, x => ({ value: x, text: x })),
      onFilter: (value, record) => record.source.indexOf(value) === 0,
      sorter: (a, b) => a.source.length - b.source.length,
    },
    {
      title: 'Target',
      dataIndex: 'target',
      key: 'target',
      filterSearch: true,
      filters: Array.from(targetTexts, x => ({ value: x, text: x })),
      onFilter: (value, record) => record.target.indexOf(value) === 0,
      sorter: (a, b) => a.target.length - b.target.length,
    },
    {
      title: 'Strength',
      dataIndex: 'size',
      key: 'strength',
      sorter: (a, b) => a.size - b.size,
    },
  ];

  const fetchRelationGraph = async fieldId => {
    try {
      setLoading(true);
      console.log('getting relation graph for field id: ', fieldId);
      let res = await API.get(`/fieldValue/relations/graph/${fieldId}`, {});
      if (res.data) {
        console.log('received data from graph:', res.data);
        setRows(res.data.edges);
        let sourceTexts = new Set();
        let targetTexts = new Set();
        for (let edge of res.data.edges) {
          sourceTexts.add(edge.source);
          targetTexts.add(edge.target);
        }
        setSourceTexts(sourceTexts);
        setTargetTexts(targetTexts);
      }
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRelationGraph(selectedRelation.id);
  }, [selectedRelation]);

  return (
    <Spin spinning={loading}>
      <Table
        dataSource={rows}
        pagination={{ pageSize: 100 }}
        scroll={{ y: scrollPosition }}
        columns={columns}
      ></Table>
    </Spin>
  );
}
