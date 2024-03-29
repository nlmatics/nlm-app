import { useState, useEffect } from 'react';

import { DynamicCellRenderer } from '../agGridComponents/DynamicCellRenderer.js';

import { Modal, Button } from 'antd';

import AgGrid from './AgGrid';
import AgGridWrapper from './AgGridWrapper/AgGridWrapper.js';

export default function SearchResultGrid(props) {
  const [rowData, setRowData] = useState([]);
  // eslint-disable-next-line
  const [gridApi, setGridApi] = useState();
  // eslint-disable-next-line
  const [columnApi, setColumnApi] = useState();
  // eslint-disable-next-line
  const [topicFacts, setTopicFacts] = useState([]);
  // eslint-disable-next-line
  const [tableWidth, setTableWidth] = useState('75vw');
  // eslint-disable-next-line
  const [tableHeight, setTableHeight] = useState('60vh');

  // eslint-disable-next-line
  const [frameworkComponents, setFrameworkComponents] = useState({
    dynamicCellRenderer: DynamicCellRenderer,
  });

  const handleCancel = () => {
    props.onClose();
  };

  useEffect(() => {
    if (props.topicFacts) {
      setTopicFacts(props.topicFacts);
      createGridData();
    } else {
      setRowData([[], []]);
    }
  }, [props.topicFacts]);

  const onGridReady = params => {
    setGridApi(params.api);
    setColumnApi(params.columnApi);
    // renderGrid(params.api);
    // params.api.redrawRows();
  };
  const headerHeightSetter = params => {
    // var padding = 20;
    // var height = headerHeightGetter() + padding;
    // gridApi.setHeaderHeight(height);
    params.api.resetRowHeights();
  };
  const onColumnResized = params => {
    params.api.resetRowHeights();
  };

  function createGridData() {
    let newRowData = [];
    props.topicFacts.forEach(fact => {
      let row = {
        answer: fact.answer,
        phrase: fact.phrase,
        match_score: fact.match_score,
        boolq_score: fact.boolq_score,
        retriever_score: fact.retriever_score,
        file_score: fact.file_score,
        raw_match_score: fact.raw_match_score,
        retriever_raw_score: fact.retriever_raw_score,
        qa_score: fact.qa_score,
        group_score: fact.group_score,
        block_text: fact.block_text,
        block_text_terms: fact.block_text_terms,
        block_type: fact.block_type,
        formatted_answer: fact.formatted_answer,
        group_type: fact.group_type,
        header_semantic_terms: fact.header_semantic_terms,
        header_text: fact.header_text,
        header_text_terms: fact.header_text_terms,
        is_override: fact.is_override,
        key: fact.key,
        match_idx: fact.match_idx,
        match_semantic_terms: fact.match_semantic_terms,
        match_text_terms: fact.match_text_terms,
        entity_types: fact.entity_types,
        page_idx: fact.page_idx,
        raw_scores: JSON.stringify(fact.raw_scores),
        relevancy_score: fact.relevancy_score,
        scaled_score: fact.scaled_score,
        semantic_score: fact.semantic_score,
        table: fact.table,
        table_all: fact.table_all,
        uniq_id: fact.uniq_id,
      };
      newRowData.push(row);
    });
    // console.log(searchTests);
    setRowData(newRowData);
  }

  var gridOptions = {
    columnDefs: [
      // {headerName: "Answer", field: "answer", sortable: true, resizable: true},
      {
        headerName: 'Formatted Answer',
        field: 'formatted_answer',
        sortable: true,
        resizable: true,
      },
      {
        headerName: 'phrase',
        field: 'phrase',
        width: '400',
        cellRenderer: 'dynamicCellRenderer',
        sortable: true,
        autoHeight: true,
        cellClass: ['cell-wrap-text', 'grid-col'],
        resizable: true,
      },
      {
        headerName: 'Header Text',
        field: 'header_text',
        sortable: true,
        resizable: true,
      },
      {
        headerName: 'Block Type',
        field: 'block_type',
        sortable: true,
        resizable: true,
      },
      {
        headerName: 'Entity Types',
        field: 'entity_types',
        sortable: true,
        autoHeight: true,
        resizable: true,
        cellClass: ['cell-wrap-text', 'grid-col'],
        cellRenderer: 'dynamicCellRenderer',
      },
      {
        headerName: 'Match Text Terms',
        field: 'match_text_terms',
        sortable: true,
        resizable: true,
        cellRenderer: 'dynamicCellRenderer',
      },
      {
        headerName: 'Match Semantic Terms',
        field: 'match_semantic_terms',
        sortable: true,
        resizable: true,
        cellRenderer: 'dynamicCellRenderer',
      },
      {
        headerName: 'Block Text Terms',
        field: 'block_text_terms',
        sortable: true,
        resizable: true,
        cellRenderer: 'dynamicCellRenderer',
      },
      {
        headerName: 'Header Text Terms',
        field: 'header_text_terms',
        sortable: true,
        resizable: true,
        cellRenderer: 'dynamicCellRenderer',
      },
      {
        headerName: 'Header Semantic Terms',
        field: 'header_semantic_terms',
        sortable: true,
        resizable: true,
        cellRenderer: 'dynamicCellRenderer',
      },
      // {headerName: "Block Text", field:"block_text", width:"500",
      //     sortable: true, resizable: true, autoHeight: true,
      //     cellClass: ['cell-wrap-text', 'grid-col']},
      {
        headerName: 'Scaled Score',
        field: 'scaled_score',
        sortable: true,
        resizable: true,
        dataType: 'number',
      },
      {
        headerName: 'Raw Match Score',
        field: 'raw_match_score',
        sortable: true,
        resizable: true,
      },
      {
        headerName: 'Match Score',
        field: 'match_score',
        sortable: true,
        resizable: true,
      },
      {
        headerName: 'Bool Score',
        field: 'boolq_score',
        sortable: true,
        resizable: true,
      },
      {
        headerName: 'Retriever Score',
        field: 'retriever_score',
        sortable: true,
        resizable: true,
      },
      {
        headerName: 'Retriever Raw Score',
        field: 'retriever_raw_score',
        sortable: true,
        resizable: true,
      },
      {
        headerName: 'Relevancy Score',
        field: 'relevancy_score',
        sortable: true,
        resizable: true,
      },
      {
        headerName: 'Group Score',
        field: 'group_score',
        sortable: true,
        resizable: true,
      },
      {
        headerName: 'Table Score',
        field: 'table_score',
        sortable: true,
        resizable: true,
      },
      {
        headerName: 'QA Score',
        field: 'qa_score',
        sortable: true,
        resizable: true,
      },
      {
        headerName: 'Semantic Score',
        field: 'semantic_score',
        sortable: true,
        resizable: true,
      },
      {
        headerName: 'File Score',
        field: 'file_score',
        sortable: true,
        resizable: true,
      },

      {
        headerName: 'Group Type',
        field: 'group_type',
        sortable: true,
        resizable: true,
      },
      {
        headerName: 'Override',
        field: 'is_override',
        sortable: true,
        resizable: true,
      },
      { headerName: 'Key', field: 'key', sortable: true, resizable: true },
      {
        headerName: 'Match Idx',
        field: 'match_idx',
        sortable: true,
        resizable: true,
      },
      {
        headerName: 'Page Idx',
        field: 'page_idx',
        sortable: true,
        resizable: true,
      },
      // {headerName: "Raw Scores", field:"raw_scores",
      //   cellClass: ['cell-wrap-text', 'grid-col'],
      //   autoHeight: true,
      //   sortable: true, resizable: true},
      // {headerName: "Table", field:"table", sortable: true, resizable: true},
      // {headerName: "Table All", field:"table_all", sortable: true, resizable: true},
      {
        headerName: 'Unique Id',
        field: 'uniq_id',
        sortable: true,
        resizable: true,
      },
    ],
    getQuickFilterText: function (params) {
      return params.value.name;
    },
  };

  const SearchTestGrid = (
    <AgGridWrapper height={tableHeight}>
      <AgGrid
        columnDefs={gridOptions.columnDefs}
        rowData={rowData}
        // getRowHeight={50}
        headerHeight={30}
        onGridReady={onGridReady}
        frameworkComponents={frameworkComponents}
        onFirstDataRendered={headerHeightSetter}
        onColumnResized={onColumnResized}
      ></AgGrid>
    </AgGridWrapper>
  );

  return (
    <Modal
      width={tableWidth}
      open={props.visible}
      destroyOnClose={true}
      footer={<Button onClick={handleCancel}>Close</Button>}
      onCancel={handleCancel}
    >
      {SearchTestGrid}
    </Modal>
  );
}
