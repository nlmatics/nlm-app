import {
  CaretDownOutlined,
  DownloadOutlined,
  ExpandAltOutlined,
  SearchOutlined,
  TableOutlined,
} from '@ant-design/icons';
import { makeStyles } from '@material-ui/styles';
import {
  Button,
  Checkbox,
  Col,
  Input,
  Modal,
  Row,
  Space,
  Spin,
  Tree,
  Typography,
} from 'antd';
import { useContext, useEffect, useMemo, useState } from 'react';
import { showResultInDocument } from '../../../../utils/helpers';
import AgGrid from '../../../AgGrid';
import AgGridWrapper from '../../../AgGridWrapper/AgGridWrapper.js';
import { WorkspaceContext } from '../../../WorkspaceContext.js';
import DocumentConfigContext from '../DocumentConfigContext';
import ThemeContext from '../../../../contexts/theme/ThemContext';
import './fileOutline.less';
import debounce from '../../../../utils/debounce';

export default function FileOutline({ documentData, outlineHeight }) {
  const { BRAND_COLOR } = useContext(ThemeContext);
  const height = outlineHeight || 'calc(100vh - 190px)';
  const useStyles = makeStyles({
    infoViewer: {
      overflowY: 'auto',
      overflowX: 'auto',
      width: '100%',
      borderRadius: '0',
    },
  });
  const classes = useStyles();
  const workspaceContext = useContext(WorkspaceContext);
  const [prevBlock, setPrevBlock] = useState(null);
  const [structuredData, setStructuredData] = useState([]);
  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([]);
  // eslint-disable-next-line
  const [loading, setLoading] = useState(false);
  const [gridApi, setGridApi] = useState();
  // eslint-disable-next-line
  const [columnApi, setColumnApi] = useState();
  const [gridName, setGridName] = useState('');
  // eslint-disable-next-line
  const [tableWidth, setTableWidth] = useState('90vw');
  // eslint-disable-next-line
  const [tableHeight, setTableHeight] = useState('60vh');
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [autoExpandParent, setAutoExpandParent] = useState();
  const [revealedOutline, setRevealedOutline] = useState(
    localStorage.getItem('nlm-revealed-outline') === 'true'
  );
  const { showTablesOnly, setShowTablesOnly } = useContext(
    DocumentConfigContext
  );

  const [isTableModalVisible, setIsTableModalVisible] = useState(false);

  const headerHeightSetter = params => {
    params.api.resetRowHeights();
    params.api.sizeColumnsToFit();
  };
  const onColumnResized = params => {
    params.api.resetRowHeights();
  };

  const showTableModal = tableNode => {
    let cols = tableNode.cols;
    let rows = tableNode.rows;
    let columnDefs = [];
    let rowData = [];
    let hasCols = cols.length > 0;
    if (hasCols) {
      tableNode.cols.map((colName, colIndex) => {
        columnDefs.push({
          headerName: colName,
          field: colName,
          sortable: true,
          resizable: true,
          autoHeight: true,
          cellClass: ['cell-wrap-text', 'grid-col'],
          cellStyle: colIndex > 0 ? { direction: 'rtl' } : {},
          type: colIndex > 0 ? 'rightAligned' : null,
        });
      });
    } else if (rows.length > 0) {
      let n_cols = rows[0].length;
      for (var colIndex = 0; colIndex < n_cols; colIndex++) {
        let colName = 'Col ' + (colIndex + 1);
        columnDefs.push({
          headerName: colName,
          field: colName,
          autoHeight: true,
          sortable: true,
          resizable: true,
          cellClass: ['cell-wrap-text', 'grid-col'],
          type: colIndex > 0 ? 'rightAligned' : null,
        });
      }
    }

    rows.map(cellValues => {
      let row = {};
      cellValues.map((cellValue, colIndex) => {
        let colName = hasCols ? cols[colIndex] : 'Col ' + (colIndex + 1);
        row[colName] = cellValue;
      });
      rowData.push(row);
    });
    setGridName(tableNode.name);
    setColumnDefs(columnDefs);
    setRowData(rowData);
    setIsTableModalVisible(true);
  };

  const handleTableOk = () => {
    setIsTableModalVisible(false);
  };

  const handleTableCancel = () => {
    setIsTableModalVisible(false);
  };

  function handleSectionClick(key, node) {
    if (!key) {
      return;
    }
    if (typeof key === 'string' || key instanceof String) {
      let keys = key.split('_');
      if (keys.length > 1) {
        key = keys[0];
      }
    }
    if (key < documentData.docSectionSummary.length) {
      const selectedSummary = documentData.docSectionSummary[key];
      const origBlock = selectedSummary['block'];
      const matchIdx = selectedSummary['match_idx'];
      const tableBbox =
        'table_bbox' in selectedSummary
          ? selectedSummary['table_bbox'][node.tableIndex]
          : null;
      const headerBbox = selectedSummary['header_bbox'];
      const selectedBlock = {
        phrase: origBlock.block_text,
        page_idx: origBlock.page_idx,
        table_page_idx: origBlock.table_page_idx,
        match_idx: matchIdx,
        table_bbox: tableBbox,
        header_bbox: headerBbox,
        page_dim: documentData.docMetadata.page_dim,
      };
      showResultInDocument(
        workspaceContext,
        prevBlock,
        selectedBlock,
        'match_idx',
        'phrase',
        'answer'
      );
      setPrevBlock(selectedBlock);
    } else {
      console.error('key not found: ' + key);
    }
  }

  function handleTreeNodeSelection(selectedKeys, info) {
    handleSectionClick(selectedKeys[0], info.node);
  }

  const onGridReady = params => {
    setLoading(true);
    console.log('grid is ready...');
    setGridApi(params.api);
    setColumnApi(params.columnApi);
    params.api.sizeColumnsToFit();
  };

  const onDownloadClick = () => {
    if (gridApi) {
      gridApi.exportDataAsExcel({
        fileName: gridName,
      });
    }
  };

  const getParentKey = (key, tree) => {
    let parentKey;
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i];
      if (node.children) {
        if (node.children.some(item => item.key === key)) {
          parentKey = node.key;
          break;
        } else if (getParentKey(key, node.children)) {
          parentKey = getParentKey(key, node.children);
          break;
        }
      }
    }
    return parentKey;
  };

  const treeData = useMemo(() => {
    const loop = data =>
      data.flatMap(item => {
        const strTitle = item.title;
        const isTableTitle = strTitle?.startsWith('Table');
        const index = strTitle
          .toLowerCase()
          .indexOf(searchValue?.toLowerCase());
        const beforeStr = strTitle.substring(0, index);
        const str = strTitle.substring(index, index + searchValue?.length);
        const afterStr = strTitle.slice(index + searchValue?.length);
        const isMatchFound = showTablesOnly && isTableTitle ? true : index >= 0;

        if (searchValue && !isMatchFound && !item?.children?.length) {
          return [];
        }
        let title =
          index > -1 ? (
            <span>
              {beforeStr}
              <span className="hilight-search-value">{str}</span>
              {afterStr}
            </span>
          ) : (
            <span>{strTitle}</span>
          );

        if (item.nodeType === 'table') {
          title = (
            <span>
              <TableOutlined style={{ marginRight: 5 }} />
              {title}
              <Button
                size="small"
                type="link"
                onClick={() => showTableModal(item)}
                icon={<ExpandAltOutlined />}
              ></Button>
            </span>
          );
        }
        if (item.children?.length) {
          const children = loop(item.children);
          if (searchValue && !isMatchFound && !children?.length) {
            return [];
          }
          return showTablesOnly
            ? children.length
              ? [
                  {
                    ...item,
                    title,
                    key: item.key,
                    children,
                  },
                ]
              : []
            : [
                {
                  ...item,
                  title,
                  key: item.key,
                  children,
                },
              ];
        }
        return showTablesOnly
          ? item.nodeType === 'table'
            ? [
                {
                  ...item,
                  title,
                  key: item.key,
                },
              ]
            : []
          : [
              {
                ...item,
                title,
                key: item.key,
              },
            ];
      });
    return loop(structuredData);
  }, [searchValue, showTablesOnly, structuredData]);

  useEffect(() => {
    const getKeys = tree =>
      tree.flatMap(item => {
        if (item.children && item.children.length) {
          return [item.key, ...getKeys(item.children)];
        }
        return [];
      });
    if (showTablesOnly) {
      const newExpandedKeys = getKeys(treeData);
      setExpandedKeys(newExpandedKeys);
      setAutoExpandParent(true);
    }
  }, [showTablesOnly, treeData]);

  const onSearch = debounce((query, showTablesOnly) => {
    setSearchValue(query);
    if (!showTablesOnly) {
      if (query) {
        const newExpandedKeys = documentData.docSectionSummary.flatMap(item => {
          if (item.title.toLowerCase().indexOf(query?.toLowerCase()) > -1) {
            return [getParentKey(item.key, structuredData)];
          }
          return [];
        });
        setExpandedKeys(newExpandedKeys);
        setAutoExpandParent(true);
      } else {
        setExpandedKeys([]);
        setAutoExpandParent(false);
      }
    }
  }, 250);

  useEffect(() => {
    console.debug(
      'TOC Hierarchy',
      documentData.docSectionSummary.map(value => ({
        level: value.block.level,
        title: value.title,
        tables: value.tables && value.tables.length,
      }))
    );

    documentData.docSectionSummary.forEach((item, index) => {
      item.nodeType = 'section';
      item.nodeData = item;
      item.key = index;
      let tables = item['tables'];
      let children = [];
      // If an item has tables add them as `children`
      if (tables && tables.length) {
        tables.forEach((tableValue, tableIndex) => {
          const tableNode = {
            title: 'Table ' + (tableIndex + 1),
            cols: tableValue['cols'],
            rows: tableValue['rows'],
            name: tableValue['name'],
            nodeType: 'table',
            nodeData: item,
            tableIndex: tableIndex,
            key: index + '_' + tableIndex,
          };
          children.push(tableNode);
        });
      }
      item.children = children;
    });
    const chunksByLevel = [];
    /**
     * Let levels be -> documentData.docSectionSummary = [0, 1, 2, 2, 2, 3, 4, 4, 5, 6, 6, 5, 5]
     * Then chunksByLevel will be -> [[0], [1], [2,2,2], [3], [4,4], [5], [6,6], [5,5]]
     */
    for (let index = 0; index < documentData.docSectionSummary.length - 1; ) {
      const item = documentData.docSectionSummary[index];
      const itemLevel = item.block.level;
      let nextIndex = index + 1;
      let nextItemLevel = documentData.docSectionSummary[nextIndex].block.level;
      while (itemLevel === nextItemLevel) {
        nextIndex++;
        if (nextIndex === documentData.docSectionSummary.length) {
          break;
        }
        nextItemLevel = documentData.docSectionSummary[nextIndex].block.level;
      }
      const chunkByLevel = documentData.docSectionSummary.slice(
        index,
        nextIndex
      );
      chunksByLevel.push(chunkByLevel);
      index = nextIndex;
    }

    console.debug({ chunksByLevel });

    const treeData = [];
    chunksByLevel.forEach(chunkByLevel => {
      const firstItemInChunk = chunkByLevel[0];
      const indexOfFirstItemInChunk =
        documentData.docSectionSummary.indexOf(firstItemInChunk);
      // Add first chunk directly since it has no parent
      if (indexOfFirstItemInChunk === 0) {
        treeData.push(...chunkByLevel);
      } else {
        let parentItem;
        let parentIndex = indexOfFirstItemInChunk - 1;
        // Find the parent
        while (parentIndex >= 0) {
          parentItem = documentData.docSectionSummary[parentIndex];
          const parentItemLevel = parentItem.block.level;
          const firstItemInChunkLevel = firstItemInChunk.block.level;
          if (firstItemInChunkLevel > parentItemLevel) {
            break;
          }
          parentIndex--;
        }
        // If parent found add to children of parent
        if (parentItem && parentIndex >= 0) {
          if (parentItem.children) {
            parentItem.children = [...parentItem.children, ...chunkByLevel];
          } else {
            parentItem.children = chunkByLevel;
          }
        } else {
          // Add as a new parent
          treeData.push(...chunkByLevel);
        }
      }
    });
    setStructuredData(treeData);
  }, [documentData.docSectionSummary]);

  const onExpand = newExpandedKeys => {
    setExpandedKeys(newExpandedKeys);
    setAutoExpandParent(false);
  };
  return (
    <>
      <Spin
        spinning={workspaceContext.loadingBasedocument}
        style={{ position: 'relative' }}
      >
        <Row gutter={[5, 5]} className="nlm-file-outline">
          <Col span={24}>
            <Input
              addonBefore={<SearchOutlined />}
              placeholder={showTablesOnly ? 'Search tables' : 'Search sections'}
              onChange={({ target: { value: query } }) => {
                onSearch(query, showTablesOnly);
              }}
              allowClear
            />
          </Col>
          <Col span={24} style={{ textAlign: 'left' }}>
            <Checkbox
              defaultChecked={showTablesOnly}
              onChange={event => {
                const checked = event.target.checked;
                setShowTablesOnly(checked);
                onSearch(searchValue, checked);
              }}
            >
              <Typography.Text style={{ fontSize: 'small' }}>
                Show only tables
              </Typography.Text>
            </Checkbox>
          </Col>
          <Col span={24}>
            <Tree
              className={classes.infoViewer}
              style={{ height }}
              onSelect={handleTreeNodeSelection}
              expandedKeys={expandedKeys}
              onExpand={onExpand}
              autoExpandParent={autoExpandParent}
              switcherIcon={<CaretDownOutlined size="small" />}
              treeData={treeData}
            />
          </Col>
        </Row>
        {!revealedOutline && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: 3,
              backgroundColor: `${BRAND_COLOR}`,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              height: '100%',
              padding: 20,
              textAlign: 'center',
            }}
          >
            {
              <Space direction="vertical">
                <Typography.Text style={{ color: '#FFF' }}>
                  Effortless organization: watch your document transform into a
                  structured outline automatically.
                </Typography.Text>
                <Button
                  onClick={() => {
                    localStorage.setItem('nlm-revealed-outline', true);
                    localStorage.setItem('outline-visible', true);
                    setRevealedOutline(true);
                  }}
                >
                  Show Outline
                </Button>
              </Space>
            }
          </div>
        )}
      </Spin>
      <Modal
        title={gridName}
        open={isTableModalVisible}
        onOk={handleTableOk}
        onCancel={handleTableCancel}
        width={tableWidth}
        footer={
          <>
            <Button icon={<DownloadOutlined />} onClick={onDownloadClick}>
              Download
            </Button>
            <Button key="submit" type="primary" onClick={handleTableCancel}>
              Close
            </Button>
          </>
        }
      >
        <AgGridWrapper height={tableHeight}>
          <AgGrid
            suppressCopyRowsToClipboard
            rowSelection="multiple"
            enableRangeSelection
            headerHeight={30}
            rowData={rowData}
            columnDefs={columnDefs}
            groupHeaderHeight={0}
            onGridReady={onGridReady}
            onFirstDataRendered={headerHeightSetter}
            onRowDataChanged={headerHeightSetter}
            onColumnResized={onColumnResized}
            toolPanel="columns"
            getRowHeight={50}
            enableBrowserTooltips={false}
            suppressMenuHide
          />
        </AgGridWrapper>
      </Modal>
    </>
  );
}
