import { forwardRef, useImperativeHandle, useState } from 'react';

import {
  Button,
  Layout,
  PageHeader,
  Select,
  Space,
  Spin,
  Typography,
} from 'antd';
import AgGrid from '../../components/AgGrid';
import AgGridWrapper from '../../components/AgGridWrapper/AgGridWrapper.js';
import useTrainingSamples from '../../hooks/useTrainingSamples.js';
import { updateTrainingSampleStatus } from '../../utils/apiCalls.js';
import { renderResult } from '../../utils/helpers.js';
import './index.less';
import useTrainingSampleStatuses from '../../hooks/useTrainingSampleStatuses';
import { FilterOutlined } from '@ant-design/icons';

const LinkCellRenderer = forwardRef(function LinkCellRenderer(props, ref) {
  const [data, setData] = useState(props.data);
  const [status, setStatus] = useState(props.data.status);
  const [saving, setSaving] = useState(false);

  const rejectSample = async () => {
    console.log('clicked on something', data.id);
    let newStatus = data.status === 'created' ? 'rejected' : 'created';
    data.status = newStatus;
    setStatus(newStatus);
    setSaving(true);
    await updateTrainingSampleStatus(data.id, data.status);
    setSaving(false);
  };

  useImperativeHandle(ref, () => {
    return {
      refresh: params => {
        if (params.data !== data) {
          setData(params.data);
        }
        return true;
      },
    };
  });

  return (
    <div style={{ width: '90%' }}>
      <Spin spinning={saving}>
        <Button
          style={{ paddingLeft: '0px' }}
          type="link"
          onClick={() => rejectSample()}
        >
          {status === 'rejected' ? 'Undo Reject' : 'Reject'}
        </Button>
      </Spin>
    </div>
  );
});

const ResultRenderer = forwardRef(function ResultRenderer(props, ref) {
  const [data, setData] = useState(props.data);

  useImperativeHandle(ref, () => {
    return {
      refresh: params => {
        if (params.data !== data) {
          setData(params.data);
        }
        return true;
      },
    };
  });

  return (
    <div className="nlm-reviewTrainingSamples">
      <div>{data.headers.join(' / ')}</div>
      <div>{data.parent_text}</div>
      <div
        style={{
          paddingTop: '5px',
          wordBreak: 'break-word',
          textAlign: 'justify',
        }}
      >
        {renderResult(null, { phrase: data.passage })}
      </div>
    </div>
  );
});

export default function ReviewTrainingSamples() {
  // eslint-disable-next-line
  const [gridApi, setGridApi] = useState();
  // eslint-disable-next-line
  const [columnApi, setColumnApi] = useState(); // nosonar
  const [statuses, setStatuses] = useState();
  const { data: trainingSamples, isLoading } = useTrainingSamples(statuses);
  const { data: trainingSampleStatuses } = useTrainingSampleStatuses();

  const frameworkComponents = {
    linkCellRenderer: LinkCellRenderer,
    resultRenderer: ResultRenderer,
  };
  const columnDefs = [
    {
      headerName: 'ID',
      field: 'id',
      colId: 'id',
      width: 120,
      minWidth: 120,
      maxWidth: 120,
      cellRenderer: params => (
        <Typography.Text copyable>{params.value}</Typography.Text>
      ),
      cellClass: ['grid-col'],
    },
    {
      headerName: 'Passage',
      field: 'passage',
      sortable: true,
      resizable: true,
      autoHeight: true,
      colId: 'passage',
      cellRenderer: 'resultRenderer',
      cellClass: ['cell-wrap-text', 'grid-col'],
    },
    {
      headerName: 'Question',
      field: 'question',
      sortable: true,
      resizable: true,
      autoHeight: true,
      width: 300,
      minWidth: 300,
      maxWidth: 300,
      colId: 'question',
      cellClass: ['cell-wrap-text', 'grid-col'],
    },
    {
      headerName: 'Answer',
      field: 'answer',
      sortable: true,
      resizable: true,
      autoHeight: true,
      width: 300,
      minWidth: 300,
      maxWidth: 300,
      colId: 'answer',
      cellClass: ['cell-wrap-text', 'grid-col'],
    },
    {
      headerName: 'Status',
      field: 'status',
      sortable: true,
      width: 100,
      minWidth: 100,
      maxWidth: 100,
      colId: 'status',
      cellClass: ['grid-col'],
    },
    {
      headerName: 'Action',
      field: 'action',
      sortable: true,
      resizable: true,
      width: 100,
      minWidth: 100,
      maxWidth: 100,
      colId: 'action',
      wrapText: true,
    },
    {
      headerName: 'Reject',
      width: 100,
      minWidth: 100,
      maxWidth: 100,
      field: 'status',
      resizable: false,
      cellRenderer: 'linkCellRenderer',
      colId: 'status',
    },
  ];

  const headerHeightSetter = params => {
    params.api.sizeColumnsToFit();
  };

  const onGridReady = params => {
    params.api.sizeColumnsToFit();
    setGridApi(params.api);
    setColumnApi(params.columnApi);
    params.api.resetRowHeights();
  };

  return (
    <PageHeader
      title="Training Data"
      extra={
        <>
          <Space>
            <FilterOutlined />
            <span>Status:</span>
          </Space>
          <Select
            allowClear
            style={{ width: 300 }}
            mode="multiple"
            options={trainingSampleStatuses?.map(status => ({
              label: status,
              value: status,
            }))}
            onChange={value => setStatuses(value)}
          ></Select>
        </>
      }
    >
      <Layout.Content>
        <Spin spinning={isLoading}>
          <AgGridWrapper height="calc(100vh - 90px)">
            <AgGrid
              suppressCopyRowsToClipboard
              rowSelection="multiple"
              headerHeight={30}
              frameworkComponents={frameworkComponents}
              rowData={trainingSamples}
              columnDefs={columnDefs}
              groupHeaderHeight={0}
              onGridReady={onGridReady}
              onFirstDataRendered={headerHeightSetter}
              onRowDataChanged={headerHeightSetter}
              toolPanel="columns"
              getRowHeight={50}
              enableBrowserTooltips={false}
              suppressHorizontalScroll={true}
              suppressMenuHide
            />
          </AgGridWrapper>
        </Spin>
      </Layout.Content>
    </PageHeader>
  );
}
