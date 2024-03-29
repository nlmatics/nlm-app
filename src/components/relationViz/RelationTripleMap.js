import { useEffect, useState } from 'react';
import { Heatmap } from '@ant-design/plots';
import { Spin } from 'antd';
import API from '../../utils/API';
import { showError } from '../../utils/apiCalls';

export default function RelationTripleMap({ selectedRelation }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('data is: ', data);
  }, [data]);

  const fetchRelationGraph = async fieldId => {
    try {
      setLoading(true);
      console.log('getting relation graph for field id: ', fieldId);
      let res = await API.get(`/fieldValue/relations/graph/${fieldId}`, {});
      if (res.data) {
        console.log('received data from graph:', res.data);
        setData(res.data.edges);
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

  const config = {
    autoFit: true,
    data,
    xField: 'source',
    yField: 'target',
    colorField: 'size',
    sizeField: 'size',
    color: ['#c6c6c6', '#9ec8e0', '#5fa4cd', '#2e7ab6', '#114d90'],
    xAxis: {
      label: {
        rotate: true,
        autoEllipsis: true,
        style: {
          textAlign: 'left',
        },
      },
    },
    meta: {
      range: [0, 10],
    },
  };

  return (
    <Spin spinning={loading}>
      <div
        style={{
          height: 'calc(100vh - 300px)',
        }}
      >
        <Heatmap {...config} />
      </div>
    </Spin>
  );
}
