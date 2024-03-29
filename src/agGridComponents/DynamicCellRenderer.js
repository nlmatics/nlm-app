import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CopyOutlined,
  DeleteOutlined,
  ExclamationCircleTwoTone,
  OrderedListOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Divider,
  message,
  Popover,
  Skeleton,
  Space,
  Spin,
  Tooltip,
  Typography,
} from 'antd';
import React, { useContext, useState, lazy, Suspense } from 'react';
import SelectCellEditor from '../components/editors/SelectCellEditor';
import { WorkspaceContext } from '../components/WorkspaceContext.js';
import API from '../utils/API.js';
import {
  approveFieldValue,
  removeAudit,
  unapproveFieldValue,
} from '../utils/apiCalls.js';
import {
  dataTypes,
  dataTypesFormatters,
  fieldEditSources,
} from '../utils/constants.js';
import {
  checkFieldBundleAccess,
  getAnswerPickerValues,
  getAnswerTypesFromCriteria,
  getDataType,
  goToFileSearch,
  isPublicWorkspace,
  replaceFieldSuffix,
} from '../utils/helpers.js';
import { getEditorByDataType } from '../components/editors/editorHelper.js';
import { formatPeriod } from '../utils/valueFormatters';
import MultiValueEditor from '../components/editors/MultiValueEditor';
import { getFormattedDateStringFromEpoch } from '../utils/dateUtils';
import useUserInfo from '../hooks/useUserInfo';
import useUserPermission from '../hooks/useUserPermission';
const SearchResultItem = lazy(() => import('../components/SearchResultItem'));
const { Text } = Typography;

export const DynamicCellRenderer = params => {
  const fieldBundleId = params?.colDef?.cellRendererParams?.fieldBundleId;
  const documentId = params?.colDef?.cellRendererParams?.documentId;
  const getViewId = params?.colDef?.cellRendererParams?.getViewId;
  // const [fieldData, setFieldData] = useState(params.colDef.valueGetter ? params.colDef.valueGetter({ data: params.data }) : params.data[params.colDef.field]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [reset, setReset] = useState(false);
  const [savingInProgress, setSavingInProgress] = useState(false);
  const [approveInProgress, setApproveInProgress] = useState(false);
  const [auditRemoveInProgress, setAuditRemoveInProgress] = useState(false);
  const { data: userInfo } = useUserInfo();
  const { isViewerRole } = useUserPermission();

  const workspaceContext = useContext(WorkspaceContext);
  const restrictEditAndApprove =
    isPublicWorkspace(workspaceContext.currentWorkspace) && isViewerRole();
  const extractCellData = () => {
    let answerDetails = null;
    let options = null;
    let answerItem = null;
    let fieldDefinition = null;
    let docId = null;
    let docName = '';
    let fieldId = null;
    if (!params.data) {
      fieldDefinition = params.colDef.fieldDefinition;
      if (fieldDefinition) {
        options = params.colDef.fieldDefinition.options;
        fieldId = fieldDefinition.id;
      }
    } else if (documentId) {
      //coming from file view
      answerDetails = params.data.answerItem?.answer_details;
      options = params.data.options;
      answerItem = params.data.answerItem;
      fieldDefinition = params.data;
      docId = documentId;
      docName = params.data.file_name;
      fieldId = fieldDefinition.fieldId;
    } else {
      let fieldName = replaceFieldSuffix(params.colDef.field);
      fieldDefinition = params.colDef.fieldDefinition;
      if (fieldDefinition) {
        options = params.colDef.fieldDefinition.options;
        fieldId = fieldDefinition.id;
      }
      docId = params?.data?.file_idx;
      docName = params.data.file_name;
      if (params.data[fieldName]) {
        if (typeof params.data[fieldName] !== 'string') {
          //coming from grid view
          answerDetails = params.data[fieldName].answer_details;
          answerItem = params.data[fieldName];
        } else {
          answerItem = { formatted_answer: params.data[fieldName] };
          if (params.data['dataType']) {
            fieldDefinition = { dataType: params.data['dataType'] };
          }
        }
      }
    }
    // console.log("answer item si...", answerItem);
    return {
      answerItem,
      answerDetails,
      options,
      fieldDefinition,
      docId,
      fieldId,
      docName,
    };
  };

  const isGroupEnabledInCriteria = cellData => {
    let fieldCriterias = cellData?.fieldDefinition?.searchCriteria?.criterias;
    let isGrouped =
      cellData.fieldDefinition?.isGrouped || //to handle document view invocation
      (fieldCriterias &&
        fieldCriterias.length > 0 &&
        fieldCriterias[0].groupFlag === 'enable');
    return isGrouped;
  };

  const getDisplayCellValue = () => {
    let lines = [];
    let cellValue = '-';
    const cellData = extractCellData();
    let dataType = getDataType(cellData.fieldDefinition, cellData.options);
    let formatter = dataTypesFormatters[dataType];
    let isGrouped = isGroupEnabledInCriteria(cellData);

    const postProcessors =
      cellData.fieldDefinition?.searchCriteria?.postProcessors;
    if (postProcessors?.length) {
      for (let postProcessor of postProcessors) {
        if (
          postProcessor.startsWith('AnswerPicker') &&
          cellData.answerItem?.formatted_answer
        ) {
          let answers = cellData.answerItem?.formatted_answer;
          let listItems = (
            typeof answers === 'string' ? answers.split(',') : answers
          ).flatMap((dataItem, index) => {
            if (typeof dataItem === 'string') {
              if (dataItem !== '') {
                return [<li key={index}>{dataItem}</li>];
              } else {
                return [];
              }
            } else {
              console.log('incorrect data format', dataItem);
            }
          });
          if (listItems.length > 0) {
            cellValue = (
              <ul className={'nlm-grid-list-formatted'}>{listItems}</ul>
            );
          }

          if (cellValue === '-' || cellValue === '') {
            if (cellData.answerItem?.phrase) {
              cellValue = '+';
            }
          }

          return cellValue;
        }
      }
    }

    if (cellData.answerItem) {
      if (
        dataType === dataTypes.LIST &&
        cellData?.fieldDefinition?.options?.selectionType === 'multiple' &&
        Array.isArray(cellData?.answerItem?.answer)
      ) {
        let listItems = cellData?.answerItem?.answer?.map((dataItem, index) => {
          if (typeof dataItem === 'string') {
            if (dataItem !== '') {
              return <li key={index}>{dataItem}</li>;
            }
          } else {
            console.log('incorrect data format', dataItem);
          }
        });
        if (listItems.length > 0) {
          cellValue = (
            <ul className={'nlm-grid-list-formatted'}>{listItems}</ul>
          );
        }
      } else if (formatter) {
        if (!isGrouped) {
          cellValue = formatter(cellData.answerItem);
        } else {
          let matches = cellData.answerItem?.matches;
          if (!matches) {
            matches = [cellData.answerItem];
          }
          const dataItems = matches?.map(match => formatter(match));
          if (dataItems && dataItems.join('') !== '') {
            let listItems = dataItems?.map((dataItem, index) => {
              if (typeof dataItem === 'string') {
                if (dataItem !== '') {
                  return <li key={index}>{dataItem}</li>;
                }
              } else {
                console.log('incorrect data format', dataItem);
              }
            });
            cellValue = (
              <ul className={'nlm-grid-list-formatted'}>{listItems}</ul>
            );
          } else {
            cellValue = <div>-</div>;
          }
        }
      } else {
        if (
          Object.prototype.hasOwnProperty.call(
            cellData.answerItem,
            'formatted_answer'
          )
        ) {
          if (params.colDef.field.indexOf('_header_text') !== -1) {
            cellValue = cellData.answerItem.header_text;
          } else {
            cellValue = cellData.answerItem.formatted_answer;
          }
          if (isGrouped && cellData.answerItem.matches) {
            for (let match of cellData.answerItem.matches) {
              lines.push(match.answer);
            }
          } else if (Array.isArray(cellValue)) {
            lines = cellValue;
            if (lines.length == 0) {
              cellValue = '-';
            }
          } else if (cellValue?.split) {
            lines = cellValue.split('/n');
          }
          if (lines.length > 1) {
            let listItems = lines.map((line, index) => (
              <li key={index}>{line}</li>
            ));
            cellValue = <ul className={'nlm-grid-list'}>{listItems}</ul>;
          }
        } else if (
          Object.prototype.hasOwnProperty.call(cellData.answerItem, 'answer')
        ) {
          cellValue = cellData.answerItem.answer;
        } else {
          cellValue = '-';
        }
      }
      if (cellValue === '-' || cellValue === '') {
        if (cellData.answerItem.phrase) {
          cellValue = '+';
        }
      }
    } else {
      //for group rows
      if (
        (params.colDef &&
          params.node.aggData &&
          params.colDef.colId in params.node.aggData) ||
        (params.node.rowGroupColumn &&
          params.colDef.colId === params.node.rowGroupColumn.colId)
      ) {
        if (formatter) {
          let formatValue = null;
          if (dataType === dataTypes.MONEY) {
            formatValue = {
              answer_details: { unit: 'USD', raw_value: params.value },
            };
          }
          if (formatValue) {
            cellValue = formatter(formatValue);
          } else {
            cellValue = params.value;
          }
        } else {
          cellValue = params.value;
        }
      } else {
        cellValue = '';
      }
    }

    if (typeof cellValue !== 'string' && !React.isValidElement(cellValue)) {
      if (Object.prototype.hasOwnProperty.call(cellData, 'formatted_answer')) {
        cellValue = cellData.formatted_answer;
      } else if (Object.prototype.hasOwnProperty.call(cellData, 'answer')) {
        cellValue = cellData.answer;
      } else {
        cellValue = '-';
      }
    }
    if (!cellValue || cellValue === '' || cellValue == '-') {
      if (params.node.group) {
        cellValue = '';
      } else {
        cellValue = '-';
      }
    }

    return cellValue;
  };

  const getRawCellValue = () => {
    const cellData = extractCellData();
    let rawCellValue = undefined;
    if (cellData) {
      if (cellData.answerDetails && cellData.answerDetails.raw_value) {
        let dataType = getDataType(cellData.fieldDefinition, cellData.options);
        if (dataType === dataTypes.PERIOD || dataType === dataTypes.MONEY) {
          rawCellValue = cellData.answerDetails;
        } else {
          rawCellValue = cellData.answerDetails.raw_value;
        }
      } else if (
        cellData.answerItem &&
        cellData.answerItem.formatted_answer &&
        Array.isArray(cellData.answerItem.formatted_answer)
      ) {
        rawCellValue = cellData.answerItem.formatted_answer;
      } else {
        rawCellValue = getDisplayCellValue();
      }
    }
    return rawCellValue;
  };

  //contains new cellvalue returned by editor
  const [editorCellValue, setEditorCellValue] = useState();
  const resetEditorCellValue = () => setEditorCellValue(null);

  const copyResultToClipboard = () => {
    const el = document.createElement('textarea');
    el.value = getDisplayCellValue();
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    message.success('Value copied to clipboard');
  };

  const openAnswerList = () => {
    if (params.colDef.cellRendererParams) {
      params.colDef.cellRendererParams.onOpen(params);
      setMenuVisible(false);
    }
  };

  const onCopyButtonClicked = () => {
    copyResultToClipboard();
    setMenuVisible(false);
  };

  const onRemoveAudit = async (cellData, fieldBundleId) => {
    setAuditRemoveInProgress(true);
    setMenuVisible(false);
    let res = await removeAudit(
      cellData.docId,
      cellData.fieldId,
      fieldBundleId
    );
    // let newResults = await loadFieldSearchResults();
    if (res.top_fact) {
      let topResult = res.top_fact;
      // When top_fact is an empty object answerItem is set as
      // empty object. Creating a structure with answer_details
      // in it so that renderer renders correct value '-'
      // for empty answers.
      cellData.answerItem = {
        ...topResult,
        answer_details: {
          ...topResult.answer_details,
        },
      };
      let fieldValue = {
        docId: cellData.docId,
        fieldId: cellData.fieldId,
        workspaceId: workspaceContext.currentWorkspaceId,
        selectedRow: cellData.answerItem,
      };
      workspaceContext.setFieldValueEditData({
        fieldId: cellData.fieldId,
        fileId: cellData.docId,
        fieldValue: fieldValue,
        source: fieldEditSources.WORKSPACE_GRID,
        fieldData: cellData.answerItem,
      });
    }
    message.info('Audit Removed');
    setAuditRemoveInProgress(false);
  };

  const onApprove = async cellData => {
    setApproveInProgress(true);
    setMenuVisible(false);
    if (cellData.answerItem) {
      let fieldValue = {
        docId: cellData.docId,
        fieldId: cellData.fieldId,
        workspaceId: workspaceContext.currentWorkspaceId,
        selectedRow: cellData.answerItem,
      };
      let isApproved = cellData.answerItem.type === 'approve';
      if (isApproved) {
        await unapproveFieldValue({
          fieldId: cellData.fieldId,
          docId: cellData.docId,
        });
      } else {
        await approveFieldValue(fieldValue);
      }
      cellData.answerItem.type = isApproved ? null : 'approve';
      workspaceContext.setFieldValueEditData({
        fieldId: cellData.fieldId,
        fileId: cellData.docId,
        fieldValue: fieldValue,
        source: fieldEditSources.WORKSPACE_GRID,
        fieldData: cellData.answerItem,
      });
    }
    setApproveInProgress(false);
  };

  const onReset = () => {
    setEditorCellValue(getRawCellValue());
    //workaround to refresh as cellValue really hasn't changed
    setReset(!reset);
  };

  const saveFieldValue = async (selectedRow, cellData) => {
    let fieldValue = {
      docId: cellData.docId,
      docName: cellData.docName,
      fieldId: cellData.fieldId,
      fieldBundleId: fieldBundleId,
      workspaceId: workspaceContext.currentWorkspaceId,
      selectedRow: selectedRow,
    };
    setSavingInProgress(true);
    setMenuVisible(false);
    try {
      const response = await API.post(`/fieldValue`, fieldValue, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const responseFieldValue = response.data;
      const { fieldId, docId, selectedRow } = responseFieldValue;
      workspaceContext.setFieldValueEditData({
        fieldId: fieldId,
        fileId: docId,
        fieldValue: responseFieldValue,
        source: fieldEditSources.WORKSPACE_GRID,
        fieldData: selectedRow,
      });
      resetEditorCellValue(null);
    } catch (error) {
      console.error(error);
      message.error({
        icon: (
          <ExclamationCircleTwoTone twoToneColor="var(--error-color-red)" />
        ),
        content: error.message,
        duration: 3,
      });
    } finally {
      setSavingInProgress(false);
    }
  };
  const onApply = cellData => {
    if (editorCellValue !== getRawCellValue()) {
      let dataType;
      let answer_details;
      let formatted_answer;
      if (editorCellValue) {
        dataType = getDataType(cellData.fieldDefinition, cellData.options);
        if (dataType === dataTypes.PERIOD) {
          formatted_answer = formatPeriod({
            answer_details: editorCellValue,
          });
          answer_details = editorCellValue;
        } else if (dataType === dataTypes.DATE) {
          formatted_answer = getFormattedDateStringFromEpoch(editorCellValue);
          // Maintaining structure as per API specification
          answer_details =
            editorCellValue === '-'
              ? {}
              : {
                  raw_value: editorCellValue,
                };
        } else if (dataType === dataTypes.MONEY) {
          if (!isNaN(editorCellValue.currencyValue)) {
            answer_details = {
              unit: editorCellValue.currencyUnit,
              raw_value: editorCellValue.currencyValue,
            };
          } else {
            answer_details = {};
          }
        } else if (dataType === dataTypes.BOOLEAN && editorCellValue === '-') {
          answer_details = {
            raw_value: null,
          };
          formatted_answer = null;
        } else {
          answer_details = {
            raw_value: editorCellValue,
          };
          formatted_answer = editorCellValue;
        }
      }
      let selectedRow = {
        answer: formatted_answer,
        formatted_answer,
        // Maintaining structure as per API specification
        ...(editorCellValue === '-' &&
        !cellData?.fieldDefinition?.isEnteredField &&
        dataType !== dataTypes.DATE
          ? {}
          : { answer_details }),
        type: 'override',
        match_idx: 'manual',
        is_override: true,
      };

      saveFieldValue(selectedRow, cellData);
    }
    // this is not necessary as the grid will send new value in response to the event
    // setCellValue(editedValue);
  };

  const openDocViewer = cellData => {
    workspaceContext.setWorkspaceEditedFieldId(cellData.fieldId);
    goToFileSearch(null, workspaceContext, { fileIdx: cellData.docId });
    setMenuVisible(false);
    // goToFileSearch(user, workspaceContext, file);
    // workspaceContext.setWorkspaceSearchSelectedResult(result);
  };

  const getEditor = cellData => {
    let editor = null;
    if (cellData) {
      let dataType;
      let options;
      let cellValue;
      dataType = getDataType(cellData.fieldDefinition, cellData.options);
      options = cellData.options;
      cellValue = getRawCellValue();
      const postProcessors =
        cellData.fieldDefinition?.searchCriteria?.postProcessors;
      if (postProcessors?.length) {
        for (let postProcessor of postProcessors) {
          if (postProcessor.startsWith('AnswerPicker')) {
            dataType = dataTypes.LIST;
            options = {
              selectionType: 'multiple',
              values: getAnswerPickerValues(postProcessor),
            };
            if (cellData.answerItem) {
              cellValue = Array.isArray(cellData.answerItem.formatted_answer)
                ? cellData.answerItem.formatted_answer
                : cellData.answerItem.formatted_answer === ''
                ? []
                : cellData.answerItem.formatted_answer?.split(',');
            }
          }
        }
      }
      let editable = checkFieldBundleAccess({
        userInfo,
        fieldBundleId,
        fieldSets: workspaceContext.fieldSets,
        currentWorkspace: workspaceContext.currentWorkspace,
      }).writeAccess;
      let isGrouped = isGroupEnabledInCriteria(cellData);
      if (dataType === dataTypes.LIST) {
        editor = (
          <SelectCellEditor
            disabled={!editable}
            options={options}
            reset={reset}
            onEdit={val => setEditorCellValue(val)}
            cellValue={cellValue}
          />
        );
      } else if (isGrouped) {
        editor = (
          <MultiValueEditor
            onEdit={matches => {
              let selectedRow = {
                answer: '',
                formatted_answer: '',
                answer_details: {},
                matches: matches,
                type: 'override',
                match_idx: 'manual',
                is_override: true,
              };
              saveFieldValue(selectedRow, cellData);
              setMenuVisible(false);
            }}
            reset={reset}
            cellData={cellData}
          />
        );
      } else {
        editor = getEditorByDataType({
          dataType: dataType,
          editable: editable,
          reset: reset,
          onEdit: val => setEditorCellValue(val),
          cellValue: getRawCellValue(),
        });
      }
    }
    return editor;
  };

  const getAuditLabel = cellData => {
    if (
      cellData &&
      cellData.fieldDefinition &&
      cellData.fieldDefinition.isEnteredField
    ) {
      return 'Edit';
    } else {
      return 'Audit (use after checking all alternate answers)';
    }
  };

  const getMenu = restrictEditAndApprove => {
    const cellData = extractCellData();
    return (
      <Card
        className="nlm-cell-details"
        style={{
          resize: 'horizontal',
          overflow: 'auto',
          width: 600,
          maxHeight: '95vh',
        }}
        hoverable
        bodyStyle={{
          padding: '0 10px 10px 10px',
        }}
      >
        {/* <Menu.Item icon={<CopyOutlined />} key="1">Copy value</Menu.Item> */}
        {cellData &&
          cellData.fieldDefinition &&
          !cellData.fieldDefinition.isEnteredField && (
            <>
              {cellData.answerItem && (
                <>
                  {params.showSearchResult ? (
                    <>
                      <Suspense fallback={<Spin />}>
                        <SearchResultItem
                          showResult={() => {
                            openDocViewer(cellData);
                          }}
                          answerTypes={getAnswerTypesFromCriteria(
                            cellData.fieldDefinition.searchCriteria?.criterias,
                            'expectedAnswerType'
                          )}
                          docId={
                            documentId ||
                            cellData.docId ||
                            cellData?.answerItem?.file_idx
                          }
                          selectedSearchCriteria={
                            cellData.fieldDefinition.searchCriteria
                          }
                          // title={cellData.answerItem.is_override? "Audited Answer": "Picked Answer"}
                          icon={<></>}
                          itemIndex={0}
                          searchResult={{ ...cellData.answerItem }}
                          docActiveTabKey="fields"
                          fieldBundleId={fieldBundleId}
                          viewId={getViewId()}
                        ></SearchResultItem>
                      </Suspense>
                      {restrictEditAndApprove ? null : (
                        <Divider orientation="left" />
                      )}
                    </>
                  ) : (
                    <></>
                  )}
                  {restrictEditAndApprove ? null : (
                    <Space>
                      <Button
                        size="small"
                        icon={<OrderedListOutlined />}
                        onClick={() => openAnswerList()}
                      >
                        Pick alternate answer
                      </Button>
                      {cellData.answerItem.is_picked ||
                      cellData.answerItem.is_override ? (
                        <Button
                          size="small"
                          icon={<DeleteOutlined />}
                          loading={auditRemoveInProgress}
                          onClick={() => onRemoveAudit(cellData, fieldBundleId)}
                        >
                          Remove Audit
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          icon={
                            cellData.answerItem.type === 'approve' ? (
                              <CloseCircleOutlined />
                            ) : (
                              <CheckCircleOutlined />
                            )
                          }
                          loading={approveInProgress}
                          onClick={() => onApprove(cellData)}
                        >
                          {cellData.answerItem.type === 'approve'
                            ? 'Unpprove'
                            : 'Approve'}
                        </Button>
                      )}
                    </Space>
                  )}
                </>
              )}
            </>
          )}
        {restrictEditAndApprove ? null : (
          <Divider orientation="left">
            <Text style={{ fontSize: '12px' }} type="secondary">
              {getAuditLabel(cellData)}
            </Text>
          </Divider>
        )}
        {restrictEditAndApprove ? null : getEditor(cellData)}
        <div>
          <Space style={{ marginTop: '10px' }}>
            {restrictEditAndApprove
              ? null
              : !isGroupEnabledInCriteria(cellData) && (
                  <Button
                    size="small"
                    loading={savingInProgress}
                    disabled={
                      !editorCellValue || editorCellValue === getRawCellValue()
                    }
                    onClick={() => onApply(cellData)}
                    type="primary"
                  >
                    Apply
                  </Button>
                )}
            {restrictEditAndApprove
              ? null
              : !isGroupEnabledInCriteria(cellData) && (
                  <Button
                    size="small"
                    visible={!isGroupEnabledInCriteria(cellData)}
                    disabled={editorCellValue === getRawCellValue()}
                    onClick={() => onReset()}
                  >
                    Reset
                  </Button>
                )}
            <Button size="small" onClick={() => setMenuVisible(false)}>
              Close
            </Button>
            <Tooltip title="copy value to clipboard">
              <Button
                size="small"
                icon={<CopyOutlined />}
                onClick={onCopyButtonClicked}
              ></Button>
            </Tooltip>
          </Space>
        </div>
      </Card>
    );
  };

  return (
    <Skeleton
      paragraph={false}
      loading={approveInProgress || auditRemoveInProgress || savingInProgress}
      active
    >
      {params.data &&
      params.colDef.cellRendererParams &&
      !params.colDef.cellRendererParams.hideMenu &&
      !params.node.group ? (
        <div className={'renderer-scrollbox'}>
          <div className={'renderer-scrollbox-content'}>
            <Popover
              content={getMenu(restrictEditAndApprove)}
              trigger="click"
              showArrow={false}
              open={menuVisible}
              onOpenChange={val => setMenuVisible(val)}
            >
              <span
                className="nlm-cell-renderer-link"
                onClick={e => e.stopPropagation()}
              >
                {getDisplayCellValue()}
              </span>
            </Popover>
          </div>
        </div>
      ) : (
        <>
          {params.node.group ? (
            <Text strong>{getDisplayCellValue()}</Text>
          ) : (
            <>{getDisplayCellValue()}</>
          )}
        </>
      )}
    </Skeleton>
  );
};
