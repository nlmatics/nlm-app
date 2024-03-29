import React, { useState, useContext, useEffect, Component } from 'react';
import { Button, Select, Input, Radio, Tree } from 'antd';
import { WorkspaceContext } from './Workspace.js';
import { ExpandAltOutlined } from '@ant-design/icons';
import {
  getSearchTests,
  getFlaggedSearchTests,
  fetchDocuments,
  runSearchTest,
} from '../utils/apiCalls.js';
import { useAuth } from '../utils/use-auth.js';
import AgGrid from './AgGrid';
import SearchResultGrid from './SearchResultGrid';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles({
  title: {
    backgroundColor: '#1B082A',
    color: '#8EABDB',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '30px',
    padding: 0,
  },
  view: {
    width: '100vw',
    height: '100vh',
    paddingLeft: '50px',
    paddingRight: '50px',
  },
  resultIcons: { marginLeft: '14px' },
  ellipsisTextOverflow: {
    width: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

const { Option } = Select;

// TODO: Refactor to lower complexity
export default function SearchTestDashboard(props) {
  // nosonar
  // Need to include state variables even if they aren't used
  const classes = useStyles();
  // eslint-disable-next-line
  const [fileTreeData, setFileTreeData] = useState([]); // nosonar
  // eslint-disable-next-line
  const [loading, setLoading] = useState(false); // nosonar
  const [searchTests, setSearchTests] = useState([]);
  const [rowData, setRowData] = useState([]);
  const [currentDocument, setCurrentDocument] = useState('all');
  const [gridApi, setGridApi] = useState();
  const [columnApi, setColumnApi] = useState();
  const workspaceContext = useContext(WorkspaceContext);
  const [currentWs, setCurrentWS] = useState(
    workspaceContext.currentWorkspaceId
  );
  const [currentDocuments, setCurrentDocuments] = useState(
    workspaceContext.documents
  );
  const [devSearchResults, setDevSearchResults] = useState();
  const [devDebugModalVisible, setDevDebugModalVisible] = useState(false);
  const [radioValue, setRadioValue] = React.useState('pos');
  const auth = useAuth();
  const user = auth.user;

  const testInfoKeys = [
    'userId',
    'testId',
    'docId',
    'workspaceId',
    'timeStamp',
  ];
  const questionInfoKeys = ['question', 'queryHeader'];
  const answerInfoKeys = ['answer', 'phrase', 'answerHeader'];
  const devAnswerInfoKeys = [
    'devAnswer',
    'devPhrase',
    'devAnswerHeader',
    'correct',
  ];
  const scoreInfoKeys = [
    'answer_score',
    'boolq_score',
    'file_score',
    'group_score',
    'match_score',
    'qnli_score',
    'question_score',
    'raw_match_score',
    'relevancy_score',
    'scaled_score',
    'sif_score',
    'squad_score',
    'table_score',
  ];
  const devScoreInfoKeys = [
    'dev_answer_score',
    'dev_boolq_score',
    'dev_file_score',
    'dev_group_score',
    'dev_match_score',
    'dev_qnli_score',
    'dev_question_score',
    'dev_raw_match_score',
    'dev_relevancy_score',
    'dev_scaled_score',
    'dev_sif_score',
    'dev_squad_score',
    'dev_table_score',
  ];

  const [expandedKeys, setExpandedKeys] = useState([]);
  const [checkedKeys, setCheckedKeys] = useState(testInfoKeys);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [autoExpandParent, setAutoExpandParent] = useState(true);

  const [expandedKeys2, setExpandedKeys2] = useState(['0-0-0', '0-0-1']);
  const [checkedKeys2, setCheckedKeys2] = useState(questionInfoKeys);
  const [selectedKeys2] = useState([]);
  const [autoExpandParent2, setAutoExpandParent2] = useState(true);

  const [expandedKeys3, setExpandedKeys3] = useState(['0-0-0', '0-0-1']);
  const [checkedKeys3, setCheckedKeys3] = useState(answerInfoKeys);
  const [selectedKeys3] = useState([]);
  const [autoExpandParent3, setAutoExpandParent3] = useState(true);

  const [expandedKeys4, setExpandedKeys4] = useState(['0-0-0', '0-0-1']);
  const [checkedKeys4, setCheckedKeys4] = useState(scoreInfoKeys);
  const [selectedKeys4] = useState([]);
  const [autoExpandParent4, setAutoExpandParent4] = useState(true);

  const [expandedKeys5, setExpandedKeys5] = useState(['0-0-0', '0-0-1']);
  const [checkedKeys5, setCheckedKeys5] = useState(devAnswerInfoKeys);
  const [selectedKeys5] = useState([]);
  const [autoExpandParent5, setAutoExpandParent5] = useState(true);

  const [expandedKeys6, setExpandedKeys6] = useState(['0-0-0', '0-0-1']);
  const [checkedKeys6, setCheckedKeys6] = useState(devScoreInfoKeys);
  const [selectedKeys6] = useState([]);
  const [autoExpandParent6, setAutoExpandParent6] = useState(true);
  const [topicFacts, setTopicFacts] = useState([]);

  // if the element is selected, it will display that column
  const showsSelectedColumns = (element, currentCheckedKeys) => {
    if (currentCheckedKeys.includes(element) === false) {
      columnApi.setColumnVisible(element, false);
    } else {
      columnApi.setColumnVisible(element, true);
    }
  };

  const onExpand = currentExpandedKeys => {
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded children keys.

    setExpandedKeys(currentExpandedKeys);
    setAutoExpandParent(false);
  };

  const onCheck = currentCheckedKeys => {
    // update Grid
    testInfoKeys.forEach(element => {
      showsSelectedColumns(element, currentCheckedKeys);
    });
    setCheckedKeys(currentCheckedKeys);
  };

  const onSelect = currentSelectedKeys => {
    setSelectedKeys(currentSelectedKeys);
  };

  const onExpand2 = currentExpandedKeys => {
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded children keys.

    setExpandedKeys2(currentExpandedKeys);
    setAutoExpandParent2(false);
  };

  const onCheck2 = currentCheckedKeys => {
    questionInfoKeys.forEach(element => {
      showsSelectedColumns(element, currentCheckedKeys);
    });
    setCheckedKeys2(currentCheckedKeys);
  };

  const onExpand3 = currentExpandedKeys => {
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded children keys.

    setExpandedKeys3(currentExpandedKeys);
    setAutoExpandParent3(false);
  };

  const onCheck3 = currentCheckedKeys => {
    answerInfoKeys.forEach(element => {
      showsSelectedColumns(element, currentCheckedKeys);
    });
    setCheckedKeys3(currentCheckedKeys);
  };

  const onExpand4 = currentExpandedKeys => {
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded children keys.

    setExpandedKeys4(currentExpandedKeys);
    setAutoExpandParent4(false);
  };

  const onCheck4 = currentCheckedKeys => {
    scoreInfoKeys.forEach(element => {
      showsSelectedColumns(element, currentCheckedKeys);
    });
    setCheckedKeys4(currentCheckedKeys);
  };

  const onExpand5 = currentExpandedKeys => {
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded children keys.

    setExpandedKeys5(currentExpandedKeys);
    setAutoExpandParent5(false);
  };

  const onCheck5 = currentCheckedKeys => {
    devAnswerInfoKeys.forEach(element => {
      showsSelectedColumns(element, currentCheckedKeys);
    });
    setCheckedKeys5(currentCheckedKeys);
  };

  const onExpand6 = currentExpandedKeys => {
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded children keys.

    setExpandedKeys6(currentExpandedKeys);
    setAutoExpandParent6(false);
  };

  const onCheck6 = currentCheckedKeys => {
    scoreInfoKeys.forEach(element => {
      if (currentCheckedKeys.includes('dev_' + element) === false) {
        columnApi.setColumnVisible('dev_' + element, false);
      } else {
        columnApi.setColumnVisible('dev_' + element, true);
      }
    });
    setCheckedKeys6(currentCheckedKeys);
  };

  class BtnCellRenderer extends Component {
    // KR: I'm not sure if we can change "props" since it's a keyword in React... I think
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

  const LinkCellRenderer = selectedRow => {
    return (
      <div style={{ width: '100%' }}>
        <Button
          style={{ paddingLeft: '0' }}
          type="link"
          onClick={() => window.open('/workspace')}
        >
          <span className={classes.ellipsisTextOverflow}>
            {selectedRow.value}
          </span>
        </Button>
      </div>
    );
  };

  const frameworkComponents = {
    btnCellRenderer: BtnCellRenderer,
    linkCellRenderer: LinkCellRenderer,
  };
  var gridOptions = {
    columnDefs: [
      { headerName: 'Test Id', field: 'testId', sortable: true },
      { headerName: 'Creator', field: 'userId', sortable: true },
      { headerName: 'Workspace', field: 'workspaceId', sortable: true },
      { headerName: 'Document', field: 'docId', sortable: true },
      { headerName: 'Question', field: 'question', sortable: true },
      { headerName: 'Query Header', field: 'queryHeader', sortable: true },

      { headerName: 'Answer', field: 'answer', sortable: true },
      { headerName: 'Phrase', field: 'phrase', sortable: true },
      { headerName: 'Answer Header', field: 'answerHeader', sortable: true },

      {
        headerName: 'Answer Score',
        field: 'answer_score',
        sortable: true,
        cellStyle: function (params) {
          if (params.value < 0.7) {
            //mark police cells as red
            return { backgroundColor: 'red' };
          } else if (params.value !== 'NaN') {
            return { backgroundColor: 'green' };
          }
        },
      },
      { headerName: 'Boolq Score', field: 'boolq_score', sortable: true },
      { headerName: 'File Score', field: 'file_score', sortable: true },
      { headerName: 'Group Score', field: 'group_score', sortable: true },
      { headerName: 'Match Score', field: 'match_score', sortable: true },
      { headerName: 'QNLI Score', field: 'qnli_score', sortable: true },
      { headerName: 'Question Score', field: 'question_score', sortable: true },
      { headerName: 'Raw Score', field: 'raw_match_score', sortable: true },
      {
        headerName: 'Relevancy Score',
        field: 'relevancy_score',
        sortable: true,
      },
      { headerName: 'Scaled Score', field: 'scaled_score', sortable: true },
      { headerName: 'Sif Score', field: 'sif_score', sortable: true },
      { headerName: 'SQUAD Score', field: 'squad_score', sortable: true },
      { headerName: 'Table Score', field: 'table_score', sortable: true },

      { headerName: 'Dev Answer', field: 'devAnswer', sortable: true },
      { headerName: 'Dev Phrase', field: 'devPhrase', sortable: true },
      {
        headerName: 'Dev Answer Header',
        field: 'devAnswerHeader',
        sortable: true,
      },

      {
        headerName: 'Dev Answer Score',
        field: 'dev_answer_score',
        sortable: true,
      },
      {
        headerName: 'Dev Boolq Score',
        field: 'dev_boolq_score',
        sortable: true,
      },
      { headerName: 'Dev File Score', field: 'dev_file_score', sortable: true },
      {
        headerName: 'Dev Group Score',
        field: 'dev_group_score',
        sortable: true,
      },
      {
        headerName: 'Dev Match Score',
        field: 'dev_match_score',
        sortable: true,
      },
      { headerName: 'Dev QNLI Score', field: 'dev_qnli_score', sortable: true },
      {
        headerName: 'Dev Question Score',
        field: 'dev_question_score',
        sortable: true,
      },
      {
        headerName: 'Dev Raw Score',
        field: 'dev_raw_match_score',
        sortable: true,
      },
      {
        headerName: 'Dev Relevancy Score',
        field: 'dev_relevancy_score',
        sortable: true,
      },
      {
        headerName: 'Dev Scaled Score',
        field: 'dev_scaled_score',
        sortable: true,
      },
      { headerName: 'Dev Sif Score', field: 'dev_sif_score', sortable: true },
      {
        headerName: 'Dev SQUAD Score',
        field: 'dev_squad_score',
        sortable: true,
      },
      {
        headerName: 'Dev Table Score',
        field: 'dev_table_score',
        sortable: true,
      },
      {
        headerName: 'Dev Topic Facts',
        field: 'dev_topic_facts',
        sortable: true,
        hide: true,
      },
      { headerName: 'correct', field: 'correct', sortable: true },
      {
        headerName: 'Dev Topic Facts',
        field: 'devTopicFacts',
        cellRenderer: 'btnCellRenderer',
        cellRendererParams: {
          clicked: function () {
            setTopicFacts(this.data.dev_topic_facts);
            setDevDebugModalVisible(true);
          },
        },
      },
      { headerName: 'Created', field: 'timeStamp', sortable: true },
    ],
    rowClassRules: {
      'rag-green': 'data.answer_score < 1',
      'rag-amber': 'data.answer_score >= 1',
      'rag-red': 'data.answer_score >= 1',
    },
    getQuickFilterText: function (params) {
      return params.value.name;
    },

    frameworkComponents: {
      btnCellRenderer: BtnCellRenderer,
    },
    rowData: rowData,
  };
  useEffect(() => {
    // update document selector
    if (currentWs !== 'all') {
      fetchDocuments(
        user,
        currentWs,
        setLoading,
        setCurrentDocuments,
        setFileTreeData,
        workspaceContext
      );
    } else {
      setCurrentDocuments([]);
    }
    if (radioValue === 'pos') {
      getSearchTests(user, currentWs, 'all', setSearchTests);
    } else {
      getFlaggedSearchTests(user, currentWs, 'all', setSearchTests);
    }
    // pull all test-cases
  }, [currentWs]);

  useEffect(() => {
    // update document selector
    if (radioValue === 'pos') {
      getSearchTests(user, currentWs, currentDocument, setSearchTests);
    } else {
      getFlaggedSearchTests(user, currentWs, currentDocument, setSearchTests);
    }
    // pull all test-cases
  }, [currentDocument]);

  useEffect(() => {
    createGridData();
  }, [devSearchResults]);

  useEffect(() => {
    if (workspaceContext.currentDocument.id) {
      // check radio value
      if (radioValue === 'pos') {
        getSearchTests(
          user,
          workspaceContext.currentWorkspaceId,
          workspaceContext.currentDocument.id
            ? workspaceContext.currentDocument.id
            : 'all',
          setSearchTests
        ); // change with doc-id later
      } else {
        getFlaggedSearchTests(
          user,
          workspaceContext.currentWorkspaceId,
          workspaceContext.currentDocument.id
            ? workspaceContext.currentDocument.id
            : 'all',
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
      getSearchTests(user, currentWs, docId, setSearchTests);
    } else {
      getFlaggedSearchTests(user, currentWs, docId, setSearchTests);
    }
  };

  const documentSelector = (
    // this is needed if in workspace mode
    <Select
      showSearch
      placeholder="all"
      className={'custom-ant-select'}
      style={{
        top: '20%',
        height: '20px',
        width: '20%',
        fontSize: '12px',
        color: 'grey',
      }}
      bordered={false}
      onSelect={onDocSelect}
      allowClear={true}
      onClear={() => {
        setCurrentDocument('all');
        setRowData([]);
      }} // set to all files
      value={currentDocument}
      dropdownMatchSelectWidth={400}
      optionFilterProp="children"
      filterOption={(inputValue, option) =>
        option.name.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
      }
    >
      {currentDocuments.length &&
        currentDocuments.map(el => (
          <Option value={el.id} key={el.id} name={el.name}>
            {el.name}
          </Option>
        ))}
    </Select>
  );

  const onWorkspaceSelect = workspaceId => {
    setCurrentWS(workspaceId);
    if (workspaceId === 'all') {
      setCurrentDocuments([]);
    }
  };

  const workspaceSelector = (
    <Select
      showSearch
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
        setCurrentWS('all');
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
      <Option value={'all'} key={'all'} name={'all'}>
        All
      </Option>
      {workspaceContext.workspaces.length &&
        workspaceContext.workspaces.map(workspace => (
          <Option value={workspace.id} key={workspace.id} name={workspace.name}>
            {workspace.name}
          </Option>
        ))}
    </Select>
  );

  const createGridData = () => {
    let newRowData = [];
    searchTests.forEach(searchTest => {
      let devAnswer = '';
      let devPhrase = '';
      let devAnswerHeader = '';

      let dev_answer_score = '';
      let dev_boolq_score = '';
      let dev_file_score = '';
      let dev_group_score = '';
      let dev_match_score = '';
      let dev_qnli_score = '';
      let dev_question_score = '';
      let dev_raw_match_score = '';
      let dev_relevancy_score = '';
      let dev_scaled_score = '';
      let dev_sif_score = '';
      let dev_squad_score = '';
      let dev_table_score = '';
      let correct = 'test not found';
      let dev_topic_facts = [];
      if (devSearchResults) {
        if (devSearchResults[searchTest._id]) {
          devAnswer =
            devSearchResults[searchTest._id]['extracted_result']['answer'];
          devPhrase =
            devSearchResults[searchTest._id]['extracted_result']['phrase'];
          devAnswerHeader =
            devSearchResults[searchTest._id]['extracted_result']['header_text'];
          if (devSearchResults[searchTest._id]['raw_scores']) {
            dev_answer_score =
              devSearchResults[searchTest._id]['raw_scores']['answer_score'];
            dev_boolq_score =
              devSearchResults[searchTest._id]['raw_scores']['boolq_score'];
            dev_file_score =
              devSearchResults[searchTest._id]['raw_scores']['file_score'];
            dev_group_score =
              devSearchResults[searchTest._id]['raw_scores']['group_score'];
            dev_match_score =
              devSearchResults[searchTest._id]['raw_scores']['match_score'];
            dev_qnli_score =
              devSearchResults[searchTest._id]['raw_scores']['qnli_score'];
            dev_question_score =
              devSearchResults[searchTest._id]['raw_scores']['question_score'];
            dev_raw_match_score =
              devSearchResults[searchTest._id]['raw_scores']['raw_match_score'];
            dev_relevancy_score =
              devSearchResults[searchTest._id]['raw_scores']['relevancy_score'];
            dev_scaled_score =
              devSearchResults[searchTest._id]['raw_scores']['scaled_score'];
            dev_sif_score =
              devSearchResults[searchTest._id]['raw_scores']['sif_score'];
            dev_squad_score =
              devSearchResults[searchTest._id]['raw_scores']['squad_score'];
            dev_table_score =
              devSearchResults[searchTest._id]['raw_scores']['table_score'];
            dev_topic_facts = devSearchResults[searchTest._id]['topic_facts'];
            correct = devSearchResults[searchTest._id]['correct'];
          }
        }
      }
      let row = {
        id: searchTest._id,
        testId: searchTest._id,
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
        devAnswer: devAnswer,
        devPhrase: devPhrase,
        devAnswerHeader: devAnswerHeader,

        dev_answer_score: dev_answer_score,
        dev_boolq_score: dev_boolq_score,
        dev_file_score: dev_file_score,
        dev_group_score: dev_group_score,
        dev_match_score: dev_match_score,
        dev_qnli_score: dev_qnli_score,
        dev_question_score: dev_question_score,
        dev_raw_match_score: dev_raw_match_score,
        dev_relevancy_score: dev_relevancy_score,
        dev_scaled_score: dev_scaled_score,
        dev_sif_score: dev_sif_score,
        dev_squad_score: dev_squad_score,
        dev_table_score: dev_table_score,
        dev_topic_facts: dev_topic_facts,
        correct: correct,

        timeStamp: searchTest.time_stamp,
      };
      if (searchTest.raw_scores) {
        scoreInfoKeys.forEach(
          e => (row[e] = parseFloat(searchTest.raw_scores[e]).toFixed(3))
        );
      }
      newRowData.push(row);
    });
    setRowData(newRowData);
  };

  function filterGrid(e) {
    gridApi.setQuickFilter(e.target.value);
  }

  const onGridReady = params => {
    setLoading(true);
    setGridApi(params.api);
    setColumnApi(params.columnApi);
    createGridData();
    params.api.redrawRows();
  };

  const SearchTestGrid = (
    <div
      className="ag-theme-alpine"
      style={{ height: 'calc(100vh - 200px)', width: 'calc(100vw - 20px)' }}
    >
      <AgGrid
        columnDefs={gridOptions.columnDefs}
        rowData={rowData}
        enableCellTextSelection={true}
        headerHeight={30}
        onGridReady={onGridReady}
        frameworkComponents={frameworkComponents}
        height={1000}
      ></AgGrid>
    </div>
  );

  function radioSwitch(e) {
    setRadioValue(e.target.value);
    if (e.target.value == 'pos') {
      getSearchTests(user, currentWs, currentDocument, setSearchTests); // change with doc-id later
    } else {
      getFlaggedSearchTests(user, currentWs, currentDocument, setSearchTests);
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

  const treeData = [
    {
      title: 'Test Case Info',
      key: 'testCaseInfo',
      children: [
        {
          title: 'Test Id',
          key: 'testId',
        },
        {
          title: 'User Id',
          key: 'userId',
        },
        {
          title: 'Workspace Id',
          key: 'workspaceId',
        },
        {
          title: 'Document Id',
          key: 'docId',
        },
        {
          title: 'Time Stamp',
          key: 'timeStamp',
        },
      ],
    },
  ];

  const treeData2 = [
    {
      title: 'Query Info',
      key: 'query',
      children: [
        {
          title: 'Question',
          key: 'question',
        },
        {
          title: 'Question Header',
          key: 'queryHeader',
        },
      ],
    },
  ];

  const treeData3 = [
    {
      title: 'Answer Info',
      key: 'answerInfo',
      children: [
        {
          title: 'Answer',
          key: 'answer',
        },
        {
          title: 'Phrase',
          key: 'phrase',
        },
        {
          title: 'Answer Header',
          key: 'answerHeader',
        },
      ],
    },
  ];

  const treeData4 = [
    {
      title: 'Scores',
      key: 'scoreInfo',
      children: [
        {
          title: 'Answer',
          key: 'answer_score',
        },
        {
          title: 'BOOLQ',
          key: 'boolq_score',
        },
        {
          title: 'File Score',
          key: 'file_score',
        },
        {
          title: 'Group',
          key: 'group_score',
        },
        {
          title: 'Match',
          key: 'match_score',
        },
        {
          title: 'QNLI',
          key: 'qnli_score',
        },
        {
          title: 'Question',
          key: 'question_score',
        },
        {
          title: 'Raw Match',
          key: 'raw_match_score',
        },
        {
          title: 'Relevancy',
          key: 'relevancy_score',
        },
        {
          title: 'Scaled',
          key: 'scaled_score',
        },
        {
          title: 'Sif',
          key: 'sif_score',
        },
        {
          title: 'SQUAD',
          key: 'squad_score',
        },
        {
          title: 'Table',
          key: 'table_score',
        },
      ],
    },
  ];

  const treeData5 = [
    {
      title: 'Dev Answer Info',
      key: 'devAnswerInfo',
      children: [
        {
          title: 'Dev Answer',
          key: 'devAnswer',
        },
        {
          title: 'Dev Phrase',
          key: 'devPhrase',
        },
        {
          title: 'Dev Answer Header',
          key: 'devAnswerHeader',
        },
        {
          title: 'Correct',
          key: 'correct',
        },
      ],
    },
  ];

  const treeData6 = [
    {
      title: 'Dev Scores',
      key: 'devScoreInfo',
      children: [
        {
          title: 'Dev Answer',
          key: 'dev_answer_score',
        },
        {
          title: 'Dev BOOLQ',
          key: 'dev_boolq_score',
        },
        {
          title: 'Dev File Score',
          key: 'dev_file_score',
        },
        {
          title: 'Dev Group',
          key: 'dev_group_score',
        },
        {
          title: 'Dev Match',
          key: 'dev_match_score',
        },
        {
          title: 'Dev QNLI',
          key: 'dev_qnli_score',
        },
        {
          title: 'Dev Question',
          key: 'dev_question_score',
        },
        {
          title: 'Dev Raw Match',
          key: 'dev_raw_match_score',
        },
        {
          title: 'Dev Relevancy',
          key: 'dev_relevancy_score',
        },
        {
          title: 'Dev Scaled Score',
          key: 'dev_scaled_score',
        },
        {
          title: 'Dev Sif',
          key: 'dev_sif_score',
        },
        {
          title: 'Dev SQUAD',
          key: 'dev_squad_score',
        },
        {
          title: 'Dev Table Score',
          key: 'dev_table_score',
        },
      ],
    },
  ];

  return (
    <div
      title="Search Test cases"
      visible={props.visible} // keep modal open if a file failed
      destroyonclose="true"
      onCancel={handleCancel}
      footer={<Button onClick={handleCancel}>Cancel</Button>}
    >
      <div style={{ display: 'inline-block', width: '1200px' }}>
        {workspaceSelector}
        {documentSelector}
        <Input onChange={filterGrid} style={{ width: '50%' }} />
        {radioGroup}
        <Button
          onClick={() => {
            runSearchTest(
              user,
              currentWs,
              currentDocument,
              setDevSearchResults
            );
          }}
        >
          Run Test Cases
        </Button>
        <div>
          <div>
            <Tree
              checkable
              onExpand={onExpand}
              expandedKeys={expandedKeys}
              autoExpandParent={autoExpandParent}
              onCheck={onCheck}
              checkedKeys={checkedKeys}
              onSelect={onSelect}
              selectedKeys={selectedKeys}
              treeData={treeData}
              style={{ width: '20%' }}
            />
            <Tree
              checkable
              onExpand={onExpand2}
              expandedKeys={expandedKeys2}
              autoExpandParent={autoExpandParent2}
              onCheck={onCheck2}
              checkedKeys={checkedKeys2}
              // onSelect={onSelect2}
              selectedKeys={selectedKeys2}
              treeData={treeData2}
              style={{ width: '20%' }}
            />
          </div>
          <div>
            <Tree
              checkable
              onExpand={onExpand3}
              expandedKeys={expandedKeys3}
              autoExpandParent={autoExpandParent3}
              onCheck={onCheck3}
              checkedKeys={checkedKeys3}
              // onSelect={onSelect3}
              selectedKeys={selectedKeys3}
              treeData={treeData3}
              style={{ width: '20%' }}
            />
            <Tree
              checkable
              onExpand={onExpand4}
              expandedKeys={expandedKeys4}
              autoExpandParent={autoExpandParent4}
              onCheck={onCheck4}
              checkedKeys={checkedKeys4}
              // onSelect={onSelect3}
              selectedKeys={selectedKeys4}
              treeData={treeData4}
              style={{ width: '20%' }}
            />
          </div>
        </div>
        <div>
          <Tree
            checkable
            onExpand={onExpand5}
            expandedKeys={expandedKeys5}
            autoExpandParent={autoExpandParent5}
            onCheck={onCheck5}
            checkedKeys={checkedKeys5}
            // onSelect={onSelect3}
            selectedKeys={selectedKeys5}
            treeData={treeData5}
            style={{ width: '20%' }}
          />
          <Tree
            checkable
            onExpand={onExpand6}
            expandedKeys={expandedKeys6}
            autoExpandParent={autoExpandParent6}
            onCheck={onCheck6}
            checkedKeys={checkedKeys6}
            // onSelect={onSelect3}
            selectedKeys={selectedKeys6}
            treeData={treeData6}
            style={{ width: '20%' }}
          />
        </div>
      </div>
      <SearchResultGrid
        onClose={() => {
          setDevDebugModalVisible(false);
        }}
        topicFacts={topicFacts}
        visible={devDebugModalVisible}
      />
      {SearchTestGrid}
    </div>
  );
}
