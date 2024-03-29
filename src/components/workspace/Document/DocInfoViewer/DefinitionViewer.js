import { SearchOutlined } from '@ant-design/icons';
import { Button, Col, Input, Row, Space, Typography } from 'antd';
import { useContext, useEffect, useState } from 'react';
import ThemeContext from '../../../../contexts/theme/ThemContext.js';
import { showResultInDocument } from '../../../../utils/helpers';
import AgGrid from '../../../AgGrid';
import AgGridWrapper from '../../../AgGridWrapper/AgGridWrapper.js';
import { WorkspaceContext } from '../../../WorkspaceContext.js';

export default function DefinitionViewer({ documentKeyInfo, height }) {
  const workspaceContext = useContext(WorkspaceContext);
  const [gridApi, setGridApi] = useState({});
  const [prevFact, setPrevFact] = useState(null);
  const [quickFilterText, setQuickFilterText] = useState('');
  const { BRAND_COLOR } = useContext(ThemeContext);
  const [revealedDefinitions, setRevealedDefinitions] = useState(
    localStorage.getItem('nlm-revealed-definitions') === 'true'
  );

  const columnDefs = [
    {
      headerName: 'Term',
      field: 'key',
      sortable: true,
      width: 140,
      sort: 'asc',
      cellClass: ['cell-wrap-text', 'field-col'],
      autoHeight: true,
      rowDrag: false,
      filter: true,
    },
    {
      headerName: 'Definition',
      field: 'value',
      flex: 1,
      cellClass: ['cell-wrap-text', 'value-col'],
      autoHeight: true,
      filter: true,
    },
  ];

  const onGridReady = params => {
    setGridApi(params.api);
  };

  const onSelectionChanged = () => {
    let selectedRow = gridApi.getSelectedRows();
    if (!selectedRow[0].count) return;
    setPrevFact(selectedRow[0]['block']);
  };

  const onCellClicked = () => {
    let selectedRow = gridApi.getSelectedRows();
    let selectedBlock = selectedRow[0]['block'];
    selectedBlock['bbox'] = [
      selectedBlock.box_style[1],
      selectedBlock.box_style[0],
      selectedBlock.box_style[1] + selectedBlock.box_style[3],
      selectedBlock.box_style[0] + selectedBlock.box_style[4],
    ];
    selectedBlock['answer'] = selectedRow[0].value;
    selectedBlock['phrase'] = selectedBlock['block_text'];

    showResultInDocument(
      workspaceContext,
      prevFact,
      selectedBlock,
      'block_idx',
      'answer'
    );
  };

  useEffect(() => {
    if (gridApi.setQuickFilter) {
      gridApi.setQuickFilter(quickFilterText);
    }
  }, [quickFilterText, gridApi]);

  return (
    <div style={{ position: 'relative' }}>
      <Row gutter={[10, 10]}>
        <Col span={24}>
          <Input
            style={{ width: '100%' }}
            allowClear
            placeholder="Search definitions"
            addonBefore={<SearchOutlined />}
            onChange={({ target: { value: quickFilterText } }) => {
              setQuickFilterText(quickFilterText);
            }}
          />
        </Col>
        <Col span={24}>
          <AgGridWrapper height={height}>
            <AgGrid
              columnDefs={columnDefs}
              rowData={documentKeyInfo?.docKeyValuePairs}
              rowSelection="single"
              rowDragManaged
              animateRows={false}
              suppressCopyRowsToClipboard
              suppressMoveWhenRowDragging
              // processCellForClipboard={processCellForClipboard}
              enableRangeSelection
              // frameworkComponents={frameworkComponents}
              onSelectionChanged={onSelectionChanged}
              headerHeight={30}
              onGridReady={onGridReady}
              // onColumnResized={onColumnResized}
              // onRowDragEnd={onRowDragEnd}
              onCellClicked={onCellClicked}
              // onCellDoubleClicked={onCellDoubleClick}
              suppressMenuHide
              // noRowsOverlayComponent="customNoRowsOverlay"
            />
          </AgGridWrapper>
        </Col>
      </Row>
      {!revealedDefinitions && (
        <Row
          style={{
            position: 'absolute',
            top: 0,
            zIndex: 2,
            width: '100%',
            height: 'calc(100vh - 75px)',
            backgroundColor: BRAND_COLOR,
          }}
          justify="center"
          align="middle"
        >
          <Col span={24} style={{ textAlign: 'center', padding: 20 }}>
            <Space direction="vertical">
              <Typography.Text style={{ color: '#FFF' }}>
                Never lose track of important terms again with automatically
                generated comprehensive list of definitions!
              </Typography.Text>
              <Button
                onClick={() => {
                  localStorage.setItem('nlm-revealed-definitions', true);
                  setRevealedDefinitions(true);
                }}
              >
                Show Definitions
              </Button>
            </Space>
          </Col>
        </Row>
      )}
    </div>
  );
}
