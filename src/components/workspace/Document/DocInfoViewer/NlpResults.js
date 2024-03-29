import {
  CheckOutlined,
  ExclamationCircleTwoTone,
  ExclamationOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Input,
  message,
  Row,
  Select,
  Spin,
  Statistic,
  Tooltip,
} from 'antd';
import {
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocation } from 'react-router-dom';
import BooleanCellEditor from '../../../../agGridComponents/AgBooleanCellEditor.js';
import DateCellEditor from '../../../../agGridComponents/AgDateCellEditor.js';
import LongTextCellEditor from '../../../../agGridComponents/AgLongTextCellEditor.js';
import NumericCellEditor from '../../../../agGridComponents/AgNumericCellEditor.js';
import SelectCellEditor from '../../../../agGridComponents/AgSelectCellEditor.js';
import { DynamicCellRenderer } from '../../../../agGridComponents/DynamicCellRenderer.js';
import useUserPermission from '../../../../hooks/useUserPermission.js';
import useViews from '../../../../hooks/useViews.js';
import API from '../../../../utils/API.js';
import {
  approveAllFields,
  saveFieldBundle,
  unapproveAllFields,
} from '../../../../utils/apiCalls.js';
import {
  fieldEditSources,
  statusTypes,
  viewFields,
} from '../../../../utils/constants.js';
import {
  isPublicWorkspace,
  showResultInDocument,
} from '../../../../utils/helpers';
import { useAuth } from '../../../../utils/use-auth.js';
import { formatAnswer } from '../../../../utils/valueFormatters.js';
import AgGrid from '../../../AgGrid';
import AgGridWrapper from '../../../AgGridWrapper/AgGridWrapper.js';
import CustomNoRowsOverlay from '../../../CustomNoRowsOverlay.js';
import { WorkspaceContext } from '../../../WorkspaceContext.js';
import useFieldBundles from '../../fields/useFieldBundles.js';
import useFieldBundleExtractionDataForDoc from './useFieldBundleExtractionDataForDoc.js';
import debounce from '../../../../utils/debounce.js';

export default memo(function NlpResults({
  setDetailVisible,
  editedField,
  setEditedField,
  record,
  renderRowData,
  documentId,
  workspaceId,
  fieldName,
  viewId,
}) {
  const location = useLocation();
  const workspaceContext = useContext(WorkspaceContext);
  const [prevFact, setPrevFact] = useState(null);
  const [approving, setApproving] = useState(false);
  const [gridApi, setGridApi] = useState({});
  // eslint-disable-next-line
  const [columnApi, setColumnApi] = useState({});
  // eslint-disable-next-line
  const [summaryWidth, setSummaryWidth] = useState('100%');
  const [quickFilterText, setQuickFilterText] = useState(fieldName);
  const extendedViewMode = useRef();
  const [approvalCount, setApprovalCount] = useState(0);
  const [fieldCount, setFieldCount] = useState(0);
  const [cellValueBeforeEdit, setCellValueBeforeEdit] = useState(null);
  const [rowData, setRowData] = useState();
  const [gridData, setGridData] = useState();
  const [docViewFieldBundleId, setDocViewFieldBundleId] = useState(null);
  const [views, setViews] = useState([]);
  const [view, setView] = useState(null);
  const [fieldIds, setFieldIds] = useState();
  const { isViewerRole } = useUserPermission();
  const {
    data,
    isLoading: fetchingViews,
    getViews,
    getViewById,
  } = useViews(workspaceId);

  const {
    defaultFieldBundleId,
    data: fieldBundles,
    isLoading: fetchingFieldBundles,
  } = useFieldBundles(workspaceId);

  const { data: fieldBundleExtractionDataForDoc, isLoading: loading } =
    useFieldBundleExtractionDataForDoc({
      fieldBundleId: docViewFieldBundleId,
      documentId,
    });

  extendedViewMode.current = workspaceContext.baseDocumentWidth;
  const statusCellStyleRules = {
    'nlm-cell-lowscore': function (params) {
      let cellData = params.data.answerItem;
      return (
        cellData &&
        cellData['formatted_answer'] !== '' &&
        !cellData['is_override'] &&
        cellData['scaled_score'] < statusTypes.CONFIDENCE_LEVEL
      );
    },
    'nlm-cell-override': function (params) {
      let cellData = params.data.answerItem;
      return cellData && !params.data.isEnteredField && cellData['is_override'];
    },
    'nlm-cell-approved': function (params) {
      let cellData = params.data.answerItem;
      return (
        cellData && !cellData['is_override'] && cellData['type'] === 'approve'
      );
    },
    'nlm-cell-workflow-field': function (params) {
      return params.data.isEnteredField;
    },
  };

  const fieldColumnDef = {
    headerName: 'Field',
    field: 'field',
    sortable: true,
    width: 140,
    cellClass: ['cell-wrap-text', 'field-col'],
    autoHeight: true,
    rowDrag: false,
    filter: true,
  };

  const valueSetter = params => {
    if (params.newValue && params.newValue.formatted_answer) {
      params.data = params.newValue;
    } else if (
      params.newValue !== null &&
      params.oldValue !== params.newValue
    ) {
      if (params.data.answerItem && params.data.answerItem.answer_details) {
        params.data.answerItem.answer_details.raw_value = params.newValue;
        params.data.value = params.newValue;
        const formattedAnswer = formatAnswer(
          params.data.answerItem.answer_details,
          params.data.options
        );
        params.data[viewFields.FORMATTED_ANSWER] = formattedAnswer;
        params.data[viewFields.ANSWER] = formattedAnswer;
      } else {
        params.data[viewFields.FORMATTED_ANSWER] = params.newValue;
        params.data[viewFields.ANSWER] = params.newValue;
        params.data.value = params.newValue;
      }
    }
  };

  // shows the detail tiles for the selected row
  // @param selectedRowData   the selected row's data which comes from the Ag Grid's api
  const showDetail = selectedRowData => {
    setDetailVisible(true);

    for (let i = 0; i < selectedRowData['topic_facts'].length; i++) {
      selectedRowData['topic_facts'][i].uniqId =
        selectedRowData['topic_facts'][i].key;
      selectedRowData['topic_facts'][i].key = i;
    }
    setEditedField(selectedRowData);
  };

  const handleRendererOnOpen = params => {
    // console.log("should show details for: ", params);
    let selectedRow = params.data;
    //   let selectedRow = gridApi.getSelectedRows()[0];
    if (!selectedRow.count || selectedRow.isEnteredField) return;
    setPrevFact(selectedRow.answerItem);
    showDetail(selectedRow);
  };

  const columnDefs = useMemo(
    () => [
      fieldColumnDef,
      {
        headerName: 'Value',
        field: 'value',
        flex: 1,
        cellClass: ['cell-wrap-text'],
        cellClassRules: statusCellStyleRules,
        cellRenderer: 'dynamicCellRenderer',
        cellRendererParams: {
          showMenuOnClick: false,
          onOpen: handleRendererOnOpen,
          showSearchResult: false,
          fieldBundleId: docViewFieldBundleId,
          documentId,
        },
        autoHeight: true,
        editable: false,
        valueSetter: valueSetter,
        cellEditorSelector: params => {
          let editor = null;
          let options = {};
          let field = params.data;
          if (field.dataType === 'list') {
            editor = 'selectCellEditor'; //agRichSelectCellEditor
            options = field.options;
          } else if (field.dataType === 'text') {
            editor = 'longTextCellEditor';
          } else if (field.dataType === 'longText') {
            options = { rows: 4, cols: 60, maxLength: 200 };
            editor = 'longTextCellEditor';
          } else if (
            field.dataType === 'date' ||
            (field.options && field.options.answer_type === 'NUM:date')
          ) {
            editor = 'dateCellEditor';
          } else if (
            field.dataType === 'number' ||
            (field.options && field.options.answer_type === 'NUM:money')
          ) {
            editor = 'numericCellEditor';
            options = field.options;
          } else if (field.options && field.options.data_type === 'boolean') {
            editor = 'booleanCellEditor';
          }
          return { component: editor, params: { options: options } };
        },
        filter: true,
      },
    ],
    [docViewFieldBundleId, documentId]
  );

  const { user } = useAuth();

  useEffect(() => {
    if (workspaceContext.scrollIntoView && record)
      workspaceContext.iframe
        ? workspaceContext.setSearchPDF([
            record.page_idx,
            {
              query: record.phrase,
              phraseSearch: true,
              caseSensitive: false,
              entireWord: false,
              highlightAll: false,
              findPrevious: undefined,
            },
          ])
        : workspaceContext.scrollIntoView(
            prevFact,
            record,
            'match_idx',
            'phrase'
          );
    setPrevFact(record);
    return () => {
      if (!workspaceContext.iframe && workspaceContext.scrollIntoView)
        workspaceContext.scrollIntoView(record);
    };
  }, [record, workspaceContext.scrollIntoView]);

  useEffect(() => {
    if (gridApi?.setQuickFilter) {
      gridApi.setQuickFilter(quickFilterText);
    }
  }, [quickFilterText, gridApi]);

  useEffect(() => {
    fieldName && setQuickFilterText(fieldName);
  }, [fieldName]);

  useEffect(() => {
    if (location.state?.fieldBundleId) {
      setDocViewFieldBundleId(location.state?.fieldBundleId);
    } else {
      setDocViewFieldBundleId(defaultFieldBundleId);
    }
  }, [location.state?.fieldBundleId, defaultFieldBundleId]);

  useEffect(() => {
    if (fieldBundleExtractionDataForDoc && fieldIds?.length) {
      const rowData = renderRowData(fieldBundleExtractionDataForDoc);
      setGridData(rowData.filter(({ fieldId }) => fieldIds.includes(fieldId)));
      setRowData(rowData);
    }
  }, [fieldBundleExtractionDataForDoc, fieldIds]);

  useEffect(() => {
    const fieldValueEditData = workspaceContext.fieldValueEditData;
    if (fieldValueEditData && fieldValueEditData.fieldValue) {
      if (
        gridApi &&
        gridApi.forEachNode &&
        Object.keys(fieldValueEditData.fieldValue).length > 0
      ) {
        gridApi.forEachNode(node => {
          if (
            documentId === fieldValueEditData.fileId &&
            node.data.fieldId === fieldValueEditData.fieldId
          ) {
            // node.data['topic_facts'] = [fieldValueEditData.fieldData];
            node.data['answerItem'] = fieldValueEditData.fieldData;
            // console.log("setting node value:", fieldValueEditData);
            if (fieldValueEditData.fieldData.answer_details) {
              node.setDataValue(
                'value',
                fieldValueEditData.fieldData.answer_details.raw_value
              );
            } else {
              node.setDataValue(
                'value',
                fieldValueEditData.fieldData.formatted_answer
              );
            }
            // node.setRowHeight();
            // gridApi.resetRowHeights();
          }
        });
      }
      for (let i = 0; i < rowData?.length; i++) {
        if (
          documentId === fieldValueEditData.fileId &&
          rowData[i].fieldId === fieldValueEditData.fieldId
        ) {
          rowData[i]['topic_facts'][0] = fieldValueEditData.fieldData;
        }
      }
      calculateApprovalCount();
    }
  }, [workspaceContext.fieldValueEditData]);

  useEffect(() => {
    if (gridApi.refreshCells) {
      gridApi.refreshCells();
    }
    if (gridApi.redrawRows) {
      gridApi.redrawRows();
    }
    calculateApprovalCount();
  }, [rowData]);

  // eslint-disable-next-line
  const [frameworkComponents, setFrameworkComponents] = useState({
    customNoRowsOverlay: CustomNoRowsOverlay,
    numericCellEditor: NumericCellEditor,
    booleanCellEditor: BooleanCellEditor,
    dateCellEditor: DateCellEditor,
    selectCellEditor: SelectCellEditor,
    dynamicCellRenderer: DynamicCellRenderer,
    longTextCellEditor: LongTextCellEditor,
  });

  const calculateApprovalCount = () => {
    let count = 0;
    let fieldCount = 0;
    let gridRows = rowData || [];
    for (let i = 0; i < gridRows.length; i++) {
      if (!gridRows[i].isEnteredField) {
        fieldCount = fieldCount + 1;
      }
      if (
        gridRows[i]['topic_facts'].length > 0 &&
        gridRows[i]['topic_facts'][0].type === 'approve'
      ) {
        count = count + 1;
      }
    }
    setFieldCount(fieldCount);
    setApprovalCount(count);
  };

  const processCellForClipboard = params =>
    params.column.colId === 'count' ? undefined : params.value;

  const onGridReady = params => {
    setGridApi(params.api);
    setColumnApi(params.columnApi);
  };

  const onRowDataChanged = params => {
    params.api.forEachNode(node => {
      if (
        node.data.fieldId === workspaceContext.workspaceEditedFieldId ||
        (editedField && node.data.fieldId === editedField.fieldId)
      ) {
        node.setSelected(true);
        setEditedField(node.data);
      }
    });
  };

  const onSelectionChanged = () => {
    if (gridApi.getSelectedRows() && gridApi.getSelectedRows().length > 0) {
      let selectedRows = gridApi.getSelectedRows();
      if (
        !selectedRows[0].isEnteredField &&
        selectedRows[0].topic_facts &&
        selectedRows[0].topic_facts.length > 0
      ) {
        showResultInDocument(
          workspaceContext,
          prevFact,
          selectedRows[0]['topic_facts'][0],
          'match_idx',
          'phrase'
        );
      }
    }
  };

  const onCellClicked = e => {
    //shameless hack to stop dropdown clicks from triggering this
    if (e.event.target.tagName !== 'A') {
      onSelectionChanged();
    }
  };

  const onCellEditingStarted = params => {
    setCellValueBeforeEdit({
      fieldId: params.data.fieldId,
      value: params.value,
    });
  };
  const onCellEditingStopped = params => {
    let newValue = params.data.formatted_answer;
    if (
      cellValueBeforeEdit &&
      cellValueBeforeEdit.fieldId === params.data.fieldId &&
      cellValueBeforeEdit.value !== params.data.value
    ) {
      let fieldValue = {
        docId: documentId,
        fieldId: params.data.fieldId,
        fieldBundleId: docViewFieldBundleId,
        workspaceId: workspaceContext.currentWorkspaceId,
        selectedRow: {
          answer: newValue,
          formatted_answer: newValue,
          answer_details: params.data.answerItem
            ? params.data.answerItem.answer_details
            : null,
          match_idx: 'manual',
          is_override: true,
          type: 'override',
        },
      };
      try {
        API.post(`/fieldValue`, fieldValue, {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        });
        workspaceContext.setFieldValueEditData({
          fieldId: fieldValue.fieldId,
          fileId: fieldValue.docId,
          fieldValue: fieldValue,
          topicFacts: [fieldValue.selectedRow],
          source: fieldEditSources.DOC_DATA_VIEW,
          fieldData: fieldValue.selectedRow,
        });
      } catch (error) {
        console.error(error);
        message.error({
          icon: (
            <ExclamationCircleTwoTone twoToneColor="var(--error-color-red)" />
          ),
          content: error.message,
          duration: 3,
        });
      }
    }
  };
  const onRowDragEnd = () => {
    if (gridApi) {
      let rowsToDisplay = gridApi.getModel().rowsToDisplay;
      var fieldIds = [];
      for (var row of rowsToDisplay) {
        fieldIds.push(row.data.fieldId);
      }
      var fieldBundle = {};
      fieldBundle['fieldIds'] = fieldIds;
      saveFieldBundle(user, docViewFieldBundleId, fieldBundle);
    }
  };

  const sendFieldValueEditEvent = rowData => {
    let fieldValue = {
      docId: documentId,
      fieldId: rowData.fieldId,
      workspaceId: workspaceContext.currentWorkspaceId,
      selectedRow: rowData['topic_facts'][0],
    };

    workspaceContext.setFieldValueEditData({
      fieldId: fieldValue.fieldId,
      fileId: fieldValue.docId,
      fieldValue: fieldValue,
      source: fieldEditSources.DOC_DATA_VIEW,
      fieldData: fieldValue.selectedRow,
    });
  };
  const onApproveAll = async () => {
    setApproving(true);
    await approveAllFields(docViewFieldBundleId, documentId);
    for (let i = 0; i < rowData.length; i++) {
      if (!rowData[i].isEnteredField && rowData[i]['topic_facts'][0]) {
        rowData[i]['topic_facts'][0].type = 'approve';
        sendFieldValueEditEvent(rowData[i]);
      }
    }

    setApprovalCount(fieldCount);
    setApproving(false);
  };

  useEffect(() => {
    if (!fetchingFieldBundles && fieldBundles?.length) {
      setFieldIds(fieldBundles[0].fieldIds);
    }
  }, [fieldBundles, fetchingFieldBundles]);

  useEffect(() => {
    if (data && !fetchingViews) {
      const views = getViews();
      setViews(views);
      const view = getViewById({ viewId }) || views[0];
      if (view) {
        setView(view);
        const {
          options: { columnState },
        } = view;
        const fieldIds = columnState
          .flatMap(({ hide, colId }) => (hide ? [] : [colId]))
          // Remove file_name column
          .slice(1);
        setFieldIds(fieldIds);
      }
    }
  }, [data, fetchingViews, getViews, viewId]);

  const onViewChange = useCallback(
    viewId => {
      if (docViewFieldBundleId && fieldBundles?.length) {
        let fieldIds;
        let view;
        if (viewId) {
          view = getViewById({ viewId, views });
          const {
            options: { columnState },
          } = view;
          const fieldsInView = columnState
            .flatMap(({ hide, colId }) => (hide ? [] : [colId]))
            // Remove file_name column
            .slice(1);
          fieldIds = fieldsInView;
        } else {
          fieldIds = fieldBundles[0].fieldIds;
          view = null;
        }
        setFieldIds(fieldIds);
        setView(view);
      }
    },
    [views, fieldBundles, docViewFieldBundleId]
  );

  const getViewsForFieldSet = () => {
    return views.filter(
      ({ options: { fieldSetId: id } }) => id === docViewFieldBundleId
    );
  };

  const onUnapproveAll = async () => {
    setApproving(true);
    await unapproveAllFields(docViewFieldBundleId, documentId);
    for (let i = 0; i < rowData.length; i++) {
      if (!rowData[i].isEnteredField && !!rowData[i]['topic_facts'][0]) {
        rowData[i]['topic_facts'][0].type = null;
        sendFieldValueEditEvent(rowData[i]);
      }
    }
    setApprovalCount(0);
    setApproving(false);
  };
  const onFieldFilterChange = debounce(query => setQuickFilterText(query), 250);

  return (
    <Card bodyStyle={{ padding: 10 }} className="nlm-nlp-results">
      {fieldCount > 0 &&
        !(
          isViewerRole() && isPublicWorkspace(workspaceContext.currentWorkspace)
        ) && (
          <Row style={{ marginBottom: 10 }}>
            <Col span={24}>
              <Row align="middle" justify="center">
                <Col span={8}>
                  <Statistic
                    title="Approved"
                    value={approvalCount}
                    prefix={
                      <CheckOutlined
                        style={{ color: 'var(--success-color-green)' }}
                      />
                    }
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Unapproved"
                    value={fieldCount - approvalCount}
                    prefix={
                      <ExclamationOutlined
                        style={{ color: 'var(--error-color-red)' }}
                      ></ExclamationOutlined>
                    }
                  />
                </Col>
                <Col span={8} style={{ textAlign: 'center' }}>
                  <Spin spinning={approving}>
                    {approvalCount < fieldCount ? (
                      <Tooltip title="Approve All Fields">
                        <Button
                          size="large"
                          type="link"
                          icon={
                            <CheckOutlined
                              style={{ color: 'var(--success-color-green)' }}
                            />
                          }
                          onClick={onApproveAll}
                        ></Button>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Unapprove All Fields">
                        <Button
                          size="large"
                          type="link"
                          icon={
                            <ExclamationOutlined
                              style={{ color: 'var(--error-color-red)' }}
                            ></ExclamationOutlined>
                          }
                          onClick={onUnapproveAll}
                          danger
                        ></Button>
                      </Tooltip>
                    )}
                  </Spin>
                </Col>
              </Row>
            </Col>
          </Row>
        )}
      <Row
        gutter={[10, 10]}
        style={{ marginBottom: 10 }}
        justify="end"
        align="middle"
      >
        <Col span={24}>
          <Select
            disabled={getViews()?.length === 0}
            style={{ width: '100%' }}
            showSearch
            allowClear
            value={view?.id}
            onClear={() => {
              setView(null);
            }}
            placeholder="Select a view"
            optionFilterProp="children"
            onChange={onViewChange}
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
          >
            {getViewsForFieldSet().map(({ id, name }) => (
              <Select.Option key={id} value={id}>
                {name}
              </Select.Option>
            ))}
          </Select>
        </Col>
      </Row>
      <Row style={{ marginBottom: 5, marginTop: 10 }}>
        <Col span={24}>
          <Input
            addonBefore={<FilterOutlined />}
            placeholder="Filter by field name..."
            style={{ width: '100%' }}
            defaultValue={fieldName}
            onChange={({ target: { value: query } }) => {
              onFieldFilterChange(query);
            }}
            allowClear
          />
        </Col>
      </Row>

      {loading || fetchingFieldBundles || !rowData ? (
        <Spin
          tip="Loading..."
          spinning={loading}
          style={{
            width: '100%',
            height: 'calc(100vh - 237px)',
            margin: '16vh auto',
          }}
        />
      ) : (
        <AgGridWrapper height="calc(100vh - 237px)">
          <AgGrid
            columnDefs={columnDefs}
            rowData={gridData}
            rowSelection="single"
            rowDragManaged
            animateRows={false}
            suppressCopyRowsToClipboard
            suppressMoveWhenRowDragging
            rowBuffer={25}
            editable={false}
            processCellForClipboard={processCellForClipboard}
            enableRangeSelection
            onCellEditingStarted={onCellEditingStarted}
            stopEditingWhenCellsLoseFocus={true}
            onCellEditingStopped={onCellEditingStopped}
            frameworkComponents={frameworkComponents}
            // onSelectionChanged={onSelectionChanged}
            headerHeight={30}
            onGridReady={onGridReady}
            onRowDataChanged={onRowDataChanged}
            onRowDragEnd={onRowDragEnd}
            onCellClicked={onCellClicked}
            suppressMenuHide
          />
        </AgGridWrapper>
      )}
    </Card>
  );
});
