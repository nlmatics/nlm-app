import API from '../utils/API.js';
import moment from 'moment';
import {
  displayDateFormat,
  statusTypes,
  viewFields,
} from '../utils/constants.js';
export const handleEmptyAndNullValues = filterModel => {
  // Also see createColumnDefs function
  return Object.fromEntries(
    Object.keys(filterModel).map(key => {
      let filterModelInstance;
      const filterInstance = filterModel[key];
      if (filterInstance.filterType === 'set') {
        filterInstance.values = filterInstance.values.map(value => {
          let filterValue = value;
          if (value === '-') {
            filterValue = null;
          }
          if (value === '+') {
            filterValue = '';
          }
          return filterValue;
        });
        filterModelInstance = [key, filterInstance];
      } else {
        filterModelInstance = [key, filterInstance];
      }
      return filterModelInstance;
    })
  );
};
export const getMoreData = async ({
  gridQuery,
  fieldBundleId,
  workspaceId,
  reviewStatusFilter,
  fieldIds,
  setGridState,
}) => {
  const filterModel = handleEmptyAndNullValues(gridQuery.filterModel);
  const payload = {
    workspaceId,
    fieldBundleId,
    fieldIds,
    gridQuery: {
      ...gridQuery,
      groupKeys: gridQuery.groupKeys.map(groupKey =>
        groupKey === '+' ? '' : groupKey === '-' ? null : groupKey
      ),
      ...(reviewStatusFilter ? { reviewStatusFilter } : {}),
      filterModel,
    },
  };
  setGridState(payload);
  console.debug('[Datasource] - request payload: ', payload);
  return await API.post('/extractFieldBundle/gridData', payload, {
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    },
  });
};

export const getServerSideDatasource = ({
  fieldBundleId,
  workspaceId,
  gridApi,
  reviewStatusFilter,
  fieldIds,
  setGridState,
}) => {
  return {
    getRows: async params => {
      var response = await getMoreData({
        gridQuery: params.request,
        fieldBundleId,
        workspaceId,
        reviewStatusFilter,
        fieldIds,
        setGridState,
      });
      console.debug('[Datasource] - response', response);
      if (response.status === 200) {
        let groupByFieldId;
        let rowData = response.data.results;

        if (rowData.length === 0 && params.request.startRow === 0) {
          gridApi.showNoRowsOverlay();
        } else {
          gridApi.hideOverlay();
        }
        // Is grouped data?
        if (params.request.rowGroupCols.length) {
          // Data massaging is required for grouped rows to treat null as - and '' as +
          // Actual data rows (non-group rows) don't need data massaging
          // Below check takes care of the required condition
          groupByFieldId =
            params.request.rowGroupCols[params.request.groupKeys.length]?.id;
          // Is group expanded?
          if (groupByFieldId) {
            rowData = rowData.map(result => {
              let value =
                result[groupByFieldId]?.answer_details?.formatted_value;

              if (value === null) {
                value = '-';
              }
              if (value === '') {
                value = '+';
              }
              return {
                ...result,
                [groupByFieldId]: {
                  ...result[groupByFieldId],
                  answer_details: {
                    formatted_value: value,
                    raw_value: value,
                  },
                },
              };
            });
          }
        }
        console.debug({ rowData });
        params.success({
          rowData,
          rowCount: response.data.totalMatchCount,
        });
      } else {
        // inform the grid request failed
        params.fail();
      }
    },
  };
};

export const getChildCount = ({ child_total }) => {
  return child_total;
};

export const valueSetter = params => {
  if (params.newValue && params.newValue.answer_details) {
    //answer detail as full cell data
    params.data[params.colDef.field] = params.newValue;
  } else if (
    params.newValue &&
    typeof params.newValue !== 'object' &&
    params.data[params.colDef.field] &&
    params.data[params.colDef.field].answer_details
  ) {
    params.data[params.colDef.field].answer_details.raw_value = params.newValue;
  } else if (params.newValue && params.newValue.formatted_answer) {
    params.data[params.colDef.field] = params.newValue;
  } else if (
    params.newValue &&
    params.oldValue !== params.newValue.formatted_answer
  ) {
    params.data[params.colDef.field][viewFields.FORMATTED_ANSWER] =
      params.newValue;
    params.data[params.colDef.field][viewFields.ANSWER] = params.newValue;
  }
};

export const createValueGetter = (field, type) => {
  return function (params, skipConvert) {
    // for backward compatibility when there is no field name but only id.
    let fieldValue = null;
    let value = '';
    if (params.data) {
      if (field.name in params.data) {
        fieldValue = params.data[field.name];
      } else if (field.id in params.data) {
        fieldValue = params.data[field.id];
      }
      if (fieldValue) {
        if (type) {
          value = fieldValue[type];
        } else if (
          fieldValue.answer_details &&
          fieldValue.answer_details.raw_value
        ) {
          value = fieldValue.answer_details.raw_value;
          if (!skipConvert) {
            if (
              (field.options && field.options.answer_type === 'NUM:date') ||
              (field && field.dataType === 'date')
            ) {
              value = moment(value, displayDateFormat).toDate();
            }
          }
        } else {
          value = fieldValue[viewFields.FORMATTED_ANSWER];
          if (value === '' && fieldValue.phrase) {
            value = '+';
          }
        }
      }
    } else if (params.node.group) {
      value = params.node.key;
    }
    if (!value || value === '') value = '-';
    return value;
  };
};

export const createNumericValueGetter = (field, type) => {
  return function (params) {
    if (field in params.data) {
      return params.data[field][type].toFixed(2);
    } else if (params.colDef.fieldId in params.data) {
      return params.data[params.colDef.fieldId][type].toFixed(2);
    }
  };
};

export const statusCellStyleRules = {
  'nlm-cell-lowscore': function (params) {
    if (params.data) {
      if ('Ad hoc' in params.data) {
        let currentRowData = params.data['Ad hoc'];
        return currentRowData['scaled_score'] < statusTypes.CONFIDENCE_LEVEL;
      } else {
        let cellData = params.data[params.colDef.field];
        return (
          cellData &&
          cellData['formatted_answer'] !== '' &&
          !cellData['is_override'] &&
          cellData['scaled_score'] < statusTypes.CONFIDENCE_LEVEL
        );
      }
    }
  },
  'nlm-cell-override': function (params) {
    if (params.data) {
      let cellData = params.data[params.colDef.field];
      return (
        cellData && !params.colDef.isEnteredField && cellData['is_override']
      );
    }
  },
  'nlm-cell-workflow-field': function (params) {
    return params.colDef.isEnteredField;
  },
  'nlm-cell-approved': function (params) {
    if (params.data) {
      let cellData = params.data[params.colDef.field];
      return (
        cellData && !cellData['is_override'] && cellData['type'] === 'approve'
      );
    }
  },
};

export const getCellEditor = field => {
  let editor = '';
  let answerParentType = 'DESC';
  let answerSubType = 'desc';
  let answerType = 'DESC:desc';
  if (!field.isEnteredField && field.options) {
    answerParentType = field.options.parent_type;
    answerSubType = field.options.sub_type;
    answerType = field.options.answer_type;
  }
  if (field.dataType === 'list') {
    editor = 'selectCellEditor'; //agRichSelectCellEditor
  } else if (field.dataType === 'text') {
    editor = 'longTextCellEditor';
  } else if (field.dataType === 'date' || answerSubType === 'date') {
    editor = 'dateCellEditor';
  } else if (field.dataType === 'number' || answerType === 'NUM:money') {
    editor = 'numericCellEditor';
  } else if (
    field.dataType === 'longText' ||
    ['DESC', 'ENTY', 'LOC'].indexOf(answerParentType) !== -1
  ) {
    editor = 'longTextCellEditor';
  } else if (field.options && field.options.data_type === 'boolean') {
    editor = 'booleanCellEditor';
  } else {
    editor = 'longTextCellEditor';
  }
  return editor;
};

export const getCellEditorParams = field => {
  let options = {};
  if (field.dataType === 'list') {
    options = { options: field.options };
  } else if (field.dataType === 'longText') {
    options = { rows: 4, cols: 60, maxLength: 200 };
  }
  return options;
};

export const filterColumns = ({ query, columnApi }) => {
  const allColIds = columnApi
    .getColumns()
    .flatMap(({ colDef: { colId } }) => (colId ? [colId] : []));
  if (query) {
    columnApi.setColumnsVisible(allColIds, false);

    const visibleColIds = columnApi
      .getColumns()
      .flatMap(({ colDef: { colId, headerName } }) => {
        return colId && headerName.match(new RegExp(query, 'gi'))
          ? [colId]
          : [];
      });
    columnApi.setColumnsVisible(visibleColIds, true);
  } else {
    columnApi.setColumnsVisible(allColIds, true);
  }
};
