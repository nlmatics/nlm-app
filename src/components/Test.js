import { useEffect, useState, useRef } from 'react';
import { Button, Table } from 'antd';
// import fileData from './../test-data/sample-file.json';

export default function Test() {
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      width: 150,
    },
    {
      title: 'Age',
      dataIndex: 'age',
      width: 150,
    },
    {
      title: 'Address',
      dataIndex: 'address',
    },
  ];
  const tableRef = useRef();

  const [rowData, setRowData] = useState([]);
  const scrollHeight = 240;
  const columnDef = columns;

  const resetScrollPosition = () => {
    console.log(tableRef.current);
    if (
      tableRef.current &&
      tableRef.current.getElementsByClassName('ant-table-body') &&
      tableRef.current.getElementsByClassName('ant-table-body').length > 0
    ) {
      console.log(
        'resetting scroll position',
        tableRef.current.getElementsByClassName('ant-table-body')[0].scrollTop,
        tableRef.current
      );
      tableRef.current
        .getElementsByClassName('ant-table-body')[0]
        .scrollTo(0, 0);
    }
  };
  const generateData = () => {
    console.log('generating data:');
    let data = [];
    for (let i = 0; i < 100; i++) {
      data.push({
        key: i,
        name: `Edward King ${i}`,
        age: Math.random(),
        address: `London, Park Lane no. ${i}`,
      });
    }
    setRowData(data);
    // setScrollHeight(scrollHeight + 1);
    resetScrollPosition();
    // setColumnDef(columns.slice(0))
  };
  useEffect(() => {
    generateData();
    // setColumnDef(columns.slice(0))
    // setScrollHeight(scrollHeight + 1);
    // resetScrollPosition();
  }, []);

  useEffect(() => {
    // generateData();
    // setColumnDef(columns.slice(0))
    // setScrollHeight(scrollHeight + 1);
    // resetScrollPosition();
  }, [rowData]);

  return (
    <div style={{ height: '900px', overflowY: 'auto' }}>
      <Button onClick={() => generateData()}>Generate Data</Button>
      <Table
        ref={tableRef}
        columns={columnDef}
        dataSource={rowData}
        pagination={{ pageSize: 50 }}
        scroll={{ y: scrollHeight, scrollToFirstRowOnChange: true }}
      />
    </div>
  );
}
