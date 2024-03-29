import React, { useState, useContext, useEffect, Component } from 'react';
import { Modal, Button, Select, Input, Radio, Checkbox } from 'antd';
import { WorkspaceContext } from './Workspace.js';
import { ExpandAltOutlined } from '@ant-design/icons';
import { getSearchTests, getFlaggedSearchTests } from '../utils/apiCalls.js';
import { useAuth } from '../utils/use-auth.js';
import AgGrid from './AgGrid';

const { Option } = Select;

// TODO: Refactor to reduce complexity
export default function SearchTestModal(props) {
  // nosonar
  const [searchTests, setSearchTests] = useState([]);
  const [rowData, setRowData] = useState([]);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [currentWs, setCurrentWS] = useState('all');
  const [gridApi, setGridApi] = useState();
  const [columnApi, setColumnApi] = useState();
  const workspaceContext = useContext(WorkspaceContext);
  const [radioValue, setRadioValue] = React.useState('pos');
  const auth = useAuth();
  const user = auth.user;

  class BtnCellRenderer extends Component {
    // KR: I think that "props" is a keyword in React so I don't want to change it...
    constructor(props) {
      // nosonar
      super(props);
      this.btnClickedHandler = this.btnClickedHandler.bind(this);
    }
    btnClickedHandler() {
      this.props.clicked(this.props.value);
    }
    render() {
      return (
        <Button
          size="small"
          type="link"
          onClick={this.btnClickedHandler}
          icon={<ExpandAltOutlined />}
        ></Button>
      );
    }
  }

  const frameworkComponents = {
    btnCellRenderer: BtnCellRenderer,
  };

  useEffect(() => {
    if (workspaceContext.currentDocument.id) {
      // check radio value
      if (radioValue == 'pos') {
        getSearchTests(
          user,
          workspaceContext.currentDocument.id,
          setSearchTests
        ); // change with doc-id later
      } else {
        getFlaggedSearchTests(
          user,
          workspaceContext.currentDocument.id,
          setSearchTests
        );
      }
      setCurrentDocument(workspaceContext.currentDocument.id);
    }
  }, [workspaceContext.currentDocument.id]);

  useEffect(() => {
    createGridData();
  }, [searchTests]);

  const onDocSelect = docId => {
    setCurrentDocument(docId);
    if (radioValue === 'pos') {
      getSearchTests(user, docId, setSearchTests);
    } else {
      getFlaggedSearchTests(user, docId, setSearchTests);
    }
  };

  const onGridReady = params => {
    setGridApi(params.api);
    setColumnApi(params.columnApi);
  };

  const documentSelector = (
    // this is needed if in workspace mode
    <Select
      placeholder="(select a document)"
      className={'custom-ant-select'}
      style={{
        top: '20%',
        height: '20px',
        width: '20%',
        ontSize: '12px',
      }}
      bordered={false}
      onSelect={onDocSelect}
      allowClear={true}
      onClear={() => {
        setCurrentDocument(null);
        setRowData([]);
      }} // set to all files
      value={currentDocument}
      dropdownMatchSelectWidth={400}
      optionFilterProp="children"
      filterOption={(inputValue, option) =>
        option.name.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
      }
    >
      {workspaceContext.documents.length &&
        workspaceContext.documents.map(el => (
          <Option value={el.id} key={el.id} name={el.name}>
            {el.name}
          </Option>
        ))}
    </Select>
  );

  const onWorkspaceSelect = workspaceId => {
    setCurrentWS(workspaceId);
  };

  const workspaceSelector = (
    <Select
      className={'custom-ant-select'}
      style={{
        width: '20%',
        top: '25%',
        height: '20px',
        fontSize: '12px',
        textOverflow: 'ellipsis',
      }}
      defaultValue={
        workspaceContext.currentWorkspace
          ? workspaceContext.currentWorkspace.name
          : ''
      }
      bordered={false}
      allowClear={true}
      onClear={() => {
        setCurrentWS(null);
        setRowData([]);
      }} // set to all files
      onSelect={onWorkspaceSelect}
      value={currentWs}
      dropdownMatchSelectWidth={400}
      optionFilterProp="children"
      filterOption={(inputValue, option) =>
        option.name
          ? option.name.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
          : false
      }
    >
      {workspaceContext.workspaces.length &&
        workspaceContext.workspaces.map(workspace => (
          <Option value={workspace.id} key={workspace.id} name={workspace.name}>
            {workspace.name}
          </Option>
        ))}
    </Select>
  );

  function createGridData() {
    let newRowData = [];
    searchTests.forEach(searchTest => {
      let row = {
        userId: searchTest.user_id,
        workspaceId: searchTest.workspace_id,
        docId: searchTest.doc_id,
        question: searchTest.search_criteria.template_question,
        queryHeader: searchTest.search_criteria.header_text
          ? searchTest.search_criteria.header_text
          : '',
        answerHeader: searchTest.header_text,
        answer: searchTest.search_answer.answer,
        phrase: searchTest.search_answer.phrase,
        timeStamp: searchTest.time_stamp,
      };
      if (searchTest.raw_scores) {
        Object.keys(searchTest.raw_scores).forEach(
          e => (row[e] = searchTest.raw_scores[e])
        );
      }
      newRowData.push(row);
    });
    setRowData(newRowData);
  }

  var gridOptions = {
    columnDefs: [
      { headerName: 'Creator', field: 'userId' },
      { headerName: 'Workspace', field: 'workspaceId' },
      { headerName: 'Document', field: 'docId' },
      { headerName: 'Question', field: 'question' },
      { headerName: 'Query Header', field: 'queryHeader' },
      { headerName: 'Answer', field: 'answer' },
      { headerName: 'Phrase', field: 'phrase' },
      { headerName: 'Answer Header', field: 'answerHeader' },

      { headerName: 'Answer Score', field: 'answer_score' },
      { headerName: 'Boolq Score', field: 'boolq_score' },
      { headerName: 'File Score', field: 'file_score' },
      { headerName: 'Group Score', field: 'group_score' },
      { headerName: 'Match Score', field: 'match_score' },
      { headerName: 'QNLI Score', field: 'qnli_score' },
      { headerName: 'Question Score', field: 'question_score' },
      { headerName: 'Raw Score', field: 'raw_match_score' },
      { headerName: 'Relevancy Score', field: 'relevancy_score' },
      { headerName: 'Scaled Score', field: 'scaled_score' },
      { headerName: 'Sif Score', field: 'sif_score' },
      { headerName: 'SQUAD Score', field: 'squad_score' },
      { headerName: 'Table Score', field: 'table_score' },
      { headerName: 'Created', field: 'timeStamp' },
    ],
    getQuickFilterText: function (params) {
      return params.value.name;
    },

    frameworkComponents: {
      btnCellRenderer: BtnCellRenderer,
    },
  };

  function filterGrid(e) {
    gridApi.setQuickFilter(e.target.value);
  }

  const SearchTestGrid = (
    <div
      className="ag-theme-material"
      style={{
        height: `calcWidth(100vh - 20)`,
        overflow: 'hidden',
        width: '100%',
      }}
    >
      <AgGrid
        columnDefs={gridOptions.columnDefs}
        rowData={rowData}
        onGridReady={onGridReady}
        frameworkComponents={frameworkComponents}
        height={2000}
      ></AgGrid>
    </div>
  );

  function radioSwitch(e) {
    setRadioValue(e.target.value);
    if (e.target.value == 'pos') {
      getSearchTests(user, currentDocument, setSearchTests); // change with doc-id later
    } else {
      getFlaggedSearchTests(user, currentDocument, setSearchTests);
    }
  }

  const radioGroup = (
    <Radio.Group
      onChange={radioSwitch}
      value={radioValue}
      style={{ float: 'right', width: '20%' }}
    >
      <Radio value={'pos'}>Approved Cases</Radio>
      <Radio value={'flag'}>Flagged Cases</Radio>
    </Radio.Group>
  );

  const handleCancel = () => {
    props.onClose();
  };

  function onCheckBoxChange(e) {
    let checkedValue = e.target.value;
    let checked = e.target.checked;
    if (checked) {
      columnApi.setColumnVisible(checkedValue, true);
    } else {
      columnApi.setColumnVisible(checkedValue, false);
    }
  }

  return (
    <Modal
      title="Search Test cases"
      open={props.visible} // keep modal open if a file failed
      destroyOnClose={true}
      style={{ display: 'table', width: '1000px', height: '1000px' }}
      width={'1000px'}
      height={'1000px'}
      onCancel={handleCancel}
      footer={<Button onClick={handleCancel}>Cancel</Button>}
    >
      <div style={{ display: 'inline-block', width: '1200px' }}>
        {workspaceSelector}
        {documentSelector}
        <Input onChange={filterGrid} style={{ width: '50%' }} />
        {radioGroup}
        <div>
          <Checkbox
            defaultChecked={true}
            value={'userId'}
            onChange={onCheckBoxChange}
          >
            Creator
          </Checkbox>
          <Checkbox
            defaultChecked={true}
            value={'workspaceId'}
            onChange={onCheckBoxChange}
          >
            Workspace
          </Checkbox>
          <Checkbox
            defaultChecked={true}
            value={'docId'}
            onChange={onCheckBoxChange}
          >
            Document Id
          </Checkbox>
          <Checkbox
            defaultChecked={true}
            value={'question'}
            onChange={onCheckBoxChange}
          >
            Question
          </Checkbox>
          <Checkbox
            defaultChecked={true}
            value={'queryHeader'}
            onChange={onCheckBoxChange}
          >
            Query Header
          </Checkbox>
          <Checkbox
            defaultChecked={true}
            value={'answer'}
            onChange={onCheckBoxChange}
          >
            Answer
          </Checkbox>
          <Checkbox
            defaultChecked={true}
            value={'phrase'}
            onChange={onCheckBoxChange}
          >
            Phrase
          </Checkbox>
          <Checkbox
            defaultChecked={true}
            value={'answerHeader'}
            onChange={onCheckBoxChange}
          >
            Answer Header
          </Checkbox>
        </div>
        <div>
          <Checkbox
            defaultChecked={true}
            value={'answer_score'}
            onChange={onCheckBoxChange}
          >
            Answer Score
          </Checkbox>
          <Checkbox
            defaultChecked={true}
            value={'boolq_score'}
            onChange={onCheckBoxChange}
          >
            BOOLQ Score
          </Checkbox>
          <Checkbox
            defaultChecked={true}
            value={'file_score'}
            onChange={onCheckBoxChange}
          >
            File Score
          </Checkbox>
          <Checkbox
            defaultChecked={true}
            value={'group_score'}
            onChange={onCheckBoxChange}
          >
            Group Score
          </Checkbox>
          <Checkbox
            defaultChecked={true}
            value={'match_score'}
            onChange={onCheckBoxChange}
          >
            Match Score
          </Checkbox>
          <Checkbox
            defaultChecked={true}
            value={'qnli_score'}
            onChange={onCheckBoxChange}
          >
            QNLI Score
          </Checkbox>
          <Checkbox
            defaultChecked={true}
            value={'question_score'}
            onChange={onCheckBoxChange}
          >
            Question Score
          </Checkbox>
          <Checkbox
            defaultChecked={true}
            value={'raw_match_score'}
            onChange={onCheckBoxChange}
          >
            Raw Score
          </Checkbox>
          <Checkbox
            defaultChecked={true}
            value={'relevancy_score'}
            onChange={onCheckBoxChange}
          >
            Relevancy Score
          </Checkbox>
          <Checkbox
            defaultChecked={true}
            value={'scaled_score'}
            onChange={onCheckBoxChange}
          >
            Scaled Score
          </Checkbox>
          <Checkbox
            defaultChecked={true}
            value={'sif_score'}
            onChange={onCheckBoxChange}
          >
            Sif Score
          </Checkbox>
          <Checkbox
            defaultChecked={true}
            value={'squad_score'}
            onChange={onCheckBoxChange}
          >
            SQUAD Score
          </Checkbox>
          <Checkbox
            defaultChecked={true}
            value={'table_score'}
            onChange={onCheckBoxChange}
          >
            Table Score
          </Checkbox>
          <Checkbox
            defaultChecked={true}
            value={'timeStamp'}
            onChange={onCheckBoxChange}
          >
            Created
          </Checkbox>
        </div>
      </div>
      {SearchTestGrid}
    </Modal>
  );
}
