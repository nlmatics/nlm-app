import { Table } from 'antd';
import { useEffect } from 'react';

export default function RelationNodeTable({ selectedRelation, rows }) {
  const columns = [
    {
      title: 'Name',
      dataIndex: 'label',
      key: 'label',
    },
    {
      title: 'Count',
      dataIndex: 'size',
      key: 'count',
    },
  ];

  useEffect(() => {
    console.log('opening relation node table: ', selectedRelation);
  }, [selectedRelation]);

  return <Table dataSource={rows} columns={columns}></Table>;
}
