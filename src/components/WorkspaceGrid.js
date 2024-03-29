import {
  CopyOutlined,
  DownloadOutlined,
  ExclamationCircleTwoTone,
  FilterOutlined,
  FundProjectionScreenOutlined,
  MoreOutlined,
  PlusOutlined,
  RedoOutlined,
  SaveOutlined,
  SearchOutlined,
  SplitCellsOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Dropdown,
  Form,
  Input,
  Layout,
  message,
  Modal,
  Result,
  Row,
  Select,
  Spin,
  Switch,
  Tooltip,
} from 'antd';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  useHistory,
  useLocation,
  useParams,
  useRouteMatch,
} from 'react-router-dom';
import { ActionButtonCellRenderer } from '../agGridComponents/ActionButtonCellRenderer.js';
import BooleanCellEditor from '../agGridComponents/AgBooleanCellEditor.js';
import AgDateAsNumberFilter from '../agGridComponents/AgDateAsNumberFilter.js';
import DateCellEditor from '../agGridComponents/AgDateCellEditor.js';
import LongTextCellEditor from '../agGridComponents/AgLongTextCellEditor.js';
import NumericCellEditor from '../agGridComponents/AgNumericCellEditor.js';
import AgPeriodFilter from '../agGridComponents/AgPeriodFilter.js';
import AgPeriodFilterFloatingComponent from '../agGridComponents/AgPeriodFilterFloatingComponent.js';
import SelectCellEditor from '../agGridComponents/AgSelectCellEditor.js';
import { DynamicCellRenderer } from '../agGridComponents/DynamicCellRenderer.js';
import { PassageCellRenderer } from '../agGridComponents/PassageCellRenderer.js';
import { PassageTooltipRenderer } from '../agGridComponents/PassageTooltipRenderer.js';
import useUserInfo from '../hooks/useUserInfo.js';
import useUserPermission from '../hooks/useUserPermission';
import API from '../utils/API.js';
import {
  cloneFieldSet,
  getFieldDefinition,
  saveFieldBundle,
} from '../utils/apiCalls.js';
import {
  categoricalAnswerTypes,
  dataTypes,
  fieldEditSources,
  viewFields,
  workspaceGrids,
} from '../utils/constants.js';
import debounce from '../utils/debounce.js';
import {
  clearWorkspaceSearchCriteria,
  clearWorkspaceSearchResults,
  getDataType,
  goToFileSearch,
  replaceFieldSuffix,
} from '../utils/helpers.js';
import { useAuth } from '../utils/use-auth.js';
import AgGrid from './AgGrid';
import AgGridWrapper from './AgGridWrapper/AgGridWrapper.js';
import NoFieldsMessage from './common/messages/NoFieldsMessage';
import ComparisionViewer from './ComparisionViewer';
import CustomNoRowsOverlay from './CustomNoRowsOverlay.js';
import FieldSetModal from './FieldSetModal.js';
import GridDataFilter from './filters/GridDataFilter.js';
import SearchCriteriaViewer from './SearchCriteriaViewer';
import WorkflowFieldEditor from './WorkflowFieldEditor.js';
import DetailSider from './workspace/Document/DocInfoViewer/DetailSider.js';
import {
  downloadAllData,
  fetchFieldBundles,
  fetchFieldMetaData,
  fetchFieldsInfo,
  fetchFilterOptions,
} from './workspace/fetcher.js';
import useFieldBundles from './workspace/fields/useFieldBundles.js';
import useFieldExtractionStatus from './workspace/fields/useFieldExtractionStatus.js';
import useFieldManager from './workspace/fields/useFieldManager.js';
import { chartTypes, getChartType } from './workspace/visualizations/utils.js';
import { WorkspaceContext } from './WorkspaceContext.js';
import WorkspaceGridAnswerContextCellRenderer from './WorkspaceGridAnswerContextCellRenderer.js';
import WorkspaceGridCloneFieldsModal from './WorkspaceGridCloneFieldsModal.js';
import WorkspaceGridDeleteFieldModal from './WorkspaceGridDeleteFieldModal.js';
import WorkspaceGridFieldBundleEditStatistics from './WorkspaceGridFieldBundleEditStatistics.js';
import WorkspaceGridFieldContextModal from './WorkspaceGridFieldContextModal.js';
import {
  createNumericValueGetter,
  createValueGetter,
  filterColumns,
  getCellEditor,
  getCellEditorParams,
  getChildCount,
  getServerSideDatasource,
  handleEmptyAndNullValues,
  statusCellStyleRules,
  valueSetter,
} from './workspaceGridHelper.js';
import WorkspaceGridLinkCellRenderer from './WorkspaceGridLinkCellRenderer.js';
import WorkspaceGridLoadingOverlay from './WorkspaceGridLoadingOverlay.js';
import WorkspaceGridNoRowsOverlay from './WorkspaceGridNoRowsOverlay.js';
import WorkspaceGridRenameFieldModal from './WorkspaceGridRenameFieldModal.js';
import WorkspaceGridReviewStatusFilter from './WorkspaceGridReviewStatusFilter.js';
import WorkspaceGridViewManager from './WorkspaceGridViewManager.js';
import WorkspaceGridVisualizationModal from './WorkspaceGridVisualizationModal.js';

const { Option } = Select;

// TODO: Disabled Sonar rule about functional complexity. Will need to refactor in the future
export default function WorkspaceGrid({ showOnlyFieldId, expandedView }) {
  const tableHeight = `calc(100vh - ${
    showOnlyFieldId ? (expandedView ? 200 : 300) : 200
  }px)`;
  const { workspaceId, activeMenuKey } = useParams();
  const gridType = workspaceGrids.EXTRACT;
  const history = useHistory();
  const { url } = useRouteMatch();
  const location = useLocation();
  const refreshDataGrid = location?.state?.refreshDataGrid;
  const workspaceContext = useContext(WorkspaceContext);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [gridApi, setGridApi] = useState();
  const [columnApi, setColumnApi] = useState();
  const [fieldBundleId, setFieldBundleId] = useState(null);
  const [fieldEditorVisible, setFieldEditorVisible] = useState(false);
  const [fieldEditData, setFieldEditData] = useState(null);
  const [allColumnDefs, setAllColumnDefs] = useState([]);
  const [expandedColDefs] = useState({});
  const [fieldsBeingProcessed, setFieldsBeingProcessed] = useState([]);
  const [editStatsVisible, setEditStatsVisible] = useState(false);
  const [showSideBar, setShowSideBar] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [splitMode, setSplitMode] = useState(false);
  const [compareVisible, setCompareVisible] = useState(false);
  const [clickedField, setClickedField] = useState(null);
  const [clickedDocId, setClickedDocId] = useState(null);
  const [selectedCells, setSelectedCells] = useState([]);
  const [cellValueBeforeEdit, setCellValueBeforeEdit] = useState(null);
  const [cloneFieldSetVisible, setCloneFieldSetVisible] = useState(false);
  const [defaultColumns, setDefaultColumns] = useState([]);
  const gridDataFilterVisible = false;
  const autoHeight = false;
  const [fieldBundles, setFieldBundles] = useState([]);
  const [fieldsMetaData, setFieldsMetaData] = useState([]);
  const [fieldIdsInfo, setFieldIdsInfo] = useState();
  const [fieldIds, setFieldIds] = useState([]);

  const [showCreateFieldBundleModal, setShowCreateFieldBundleModal] =
    useState(false);
  const [showDeleteFieldBundleModal, setShowDeleteFieldBundleModal] =
    useState(false);
  const [showVisualization, setShowVisualization] = useState(false);
  const [viewOnly, setViewOnly] = useState(true);
  const [visualizeFieldId, setVisualizeFieldId] = useState();
  const [visualizeFieldName, setVisualizeFieldName] = useState();
  const [chartType, setChartType] = useState();
  const [showDeleteFieldModal, setShowDeleteFieldModal] = useState(false);
  const [reviewStatusFilter, setReviewStatusFilter] = useState(null);
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [fieldToBeRenamed, setFieldToBeRenamed] = useState('');
  const [fieldToBeDeleted, setFieldToBeDeleted] = useState('');
  const [fieldsSearchQuery, setFieldsSearchQuery] = useState('');
  const viewIdRef = useRef(null);
  const setViewId = viewId => (viewIdRef.current = viewId);

  const gridStateRef = useRef(null);
  const setGridState = gridState => (gridStateRef.current = gridState);

  const prevFieldBundleIdRef = useRef();
  const isColumnMovedRef = useRef(false);

  const { useDeleteField, useRenameField, useFields, useRefetchFields } =
    useFieldManager();
  const { data: fields, isLoading: isFetchingFieldsMetaData } =
    useFields(fieldBundleId);
  const renameFieldMutation = useRenameField(fieldBundleId);
  const deleteFieldMutation = useDeleteField(fieldBundleId);
  const refetchFields = useRefetchFields();
  const { data: refetchedFieldBundles, useRefetchFieldBundles } =
    useFieldBundles(workspaceId);
  const refetchFieldBundles = useRefetchFieldBundles();
  const { data: userInfo } = useUserInfo();
  const { isAllowedToCreateField, isViewerRole } = useUserPermission();
  useEffect(() => {
    if (!isFetchingFieldsMetaData) {
      setFieldsMetaData(fields);
    }
  }, [fields, isFetchingFieldsMetaData]);

  // START: Used by DataFieldViewer when showOnlyFieldId is set
  const { isExtractionInProgress, fieldExtractionStatus } =
    useFieldExtractionStatus({
      fieldBundleId,
      fieldId: showOnlyFieldId,
    });

  useEffect(() => {
    if (isExtractionInProgress() && showOnlyFieldId) {
      console.debug('Field extraction in progress... refreshing field grid');
      setTimeout(() => {
        gridApi?.refreshServerSide();
      });
    }
  }, [gridApi, isExtractionInProgress, fieldExtractionStatus, showOnlyFieldId]);
  // END: Used by DataFieldViewer when showOnlyFieldId is set

  const onDeleteCallback = useCallback(() => {
    message.info(`${fieldToBeDeleted.name} deleted successfully.`);
  }, [fieldToBeDeleted]);

  const onRenameCallback = useCallback(({ newFieldName, oldFieldName }) => {
    message.info(`${oldFieldName} renamed to ${newFieldName} successfully.`);
  }, []);

  useEffect(() => {
    async function fetchData(workspaceId) {
      const fieldBundles = await fetchFieldBundles(workspaceId);
      setFieldBundles(fieldBundles);
      setFieldBundleId(fieldBundles && fieldBundles[0].id);
    }

    workspaceId && fetchData(workspaceId);
  }, [workspaceId]);

  useEffect(() => {
    refreshDataGrid &&
      refetchedFieldBundles?.length &&
      setFieldIds([...refetchedFieldBundles[0]?.fieldIds]);
  }, [refetchedFieldBundles, refreshDataGrid]);

  useEffect(() => {
    if (showOnlyFieldId) {
      setFieldIds([showOnlyFieldId]);
    }
  }, [showOnlyFieldId]);

  useEffect(() => {
    if (
      activeMenuKey === 'extractions' &&
      !showOnlyFieldId &&
      workspaceId &&
      fieldBundleId &&
      (fieldBundleId !== prevFieldBundleIdRef.current || refreshDataGrid)
    ) {
      refetchFields(fieldBundleId);
      refetchFieldBundles(workspaceId);
    }
    // refetchFields is not added to dependency to avoid unnecessary refetching of fields
    // Ideally explicit refetch i.e. invalidating query should be avoided and done in onSuccess handler of mutation
  }, [
    workspaceId,
    fieldBundleId,
    refreshDataGrid,
    activeMenuKey,
    showOnlyFieldId,
  ]);

  useEffect(() => {
    async function setServerSideDatasource() {
      const serverSideDatasource = getServerSideDatasource({
        fieldBundleId: fieldBundleId,
        workspaceId,
        gridApi,
        fieldIds: showOnlyFieldId ? [showOnlyFieldId] : fieldIds,
        setGridState,
      });
      setTimeout(() => {
        gridApi?.setServerSideDatasource(serverSideDatasource);
      });
      prevFieldBundleIdRef.current = fieldBundleId;
    }

    if (
      activeMenuKey === 'extractions' &&
      !showOnlyFieldId &&
      workspaceId &&
      gridApi &&
      fieldBundleId &&
      fieldIds?.length &&
      (fieldBundleId !== prevFieldBundleIdRef.current ||
        refreshDataGrid ||
        workspaceContext.refreshGrid) &&
      fieldsMetaData.length
    ) {
      setServerSideDatasource();
      workspaceContext.setRefreshGrid(false);
    }
  }, [
    workspaceId,
    fieldBundleId,
    gridApi,
    refreshDataGrid,
    workspaceContext.refreshGrid,
    activeMenuKey,
    fieldsMetaData,
    showOnlyFieldId,
    fieldIds,
  ]);

  useEffect(() => {
    async function setServerSideDatasource() {
      const serverSideDatasource = getServerSideDatasource({
        fieldBundleId: fieldBundleId,
        workspaceId,
        gridApi,
        reviewStatusFilter,
        fieldIds: showOnlyFieldId ? [showOnlyFieldId] : fieldIds,
        setGridState,
      });
      gridApi?.setServerSideDatasource(serverSideDatasource);
    }

    if (
      workspaceId &&
      gridApi &&
      fieldBundleId &&
      (fieldIds?.length || showOnlyFieldId)
    ) {
      setServerSideDatasource();
    }
  }, [
    workspaceId,
    fieldBundleId,
    gridApi,
    reviewStatusFilter,
    fieldIds,
    showOnlyFieldId,
  ]);

  useEffect(() => {
    async function getFieldIdsInfo(fieldBundleId) {
      const fieldIdsInfo = await fetchFieldsInfo(fieldBundleId);
      setFieldIdsInfo(fieldIdsInfo);
    }
    activeMenuKey === 'extractions' &&
      !showOnlyFieldId &&
      fieldBundleId &&
      getFieldIdsInfo(fieldBundleId);
  }, [fieldBundleId, activeMenuKey, showOnlyFieldId]);

  useEffect(() => {
    async function getFieldIdsInfo(fieldBundleId) {
      const fieldIdsInfo = await fetchFieldsInfo(fieldBundleId);
      setFieldIdsInfo(fieldIdsInfo);
    }
    activeMenuKey === 'extractions' &&
      !showOnlyFieldId &&
      fieldBundleId &&
      refreshDataGrid &&
      getFieldIdsInfo(fieldBundleId);
  }, [fieldBundleId, activeMenuKey, refreshDataGrid, showOnlyFieldId]);

  useEffect(() => {
    async function getFieldBundles(workspaceId) {
      const fieldBundles = await fetchFieldBundles(workspaceId);
      setFieldBundles(fieldBundles);
    }
    if (refreshDataGrid) {
      getFieldBundles(workspaceId);
    }
  }, [refreshDataGrid, workspaceId]);

  useEffect(() => {
    let fields = [];
    let newFieldsBeingProcessed = [];
    if (fieldIdsInfo) {
      fieldIdsInfo.forEach(field => {
        fields.push({ topicId: field.field_id, topic: field.name });
        if (field.status && field.status.progress !== 'done') {
          newFieldsBeingProcessed.push(field);
        }
      });

      const fieldIdsBeingProcessed = fieldsBeingProcessed.map(
        ({ field_id }) => field_id
      );

      const newFieldIdsBeingProcessed = newFieldsBeingProcessed.map(
        ({ field_id }) => field_id
      );
      console.debug({ fieldIdsBeingProcessed });
      console.debug({ newFieldIdsBeingProcessed });

      const isSomethingProcessed = fieldIdsBeingProcessed.some(fieldId => {
        return !newFieldIdsBeingProcessed.includes(fieldId);
      });

      console.debug({ isSomethingProcessed });

      if (isSomethingProcessed) {
        message.info('Field processing is completed. Refreshing grid.');
        setTimeout(() => {
          setLoading(true);
          gridApi?.refreshServerSide();
          setLoading(false);
        });
      }
      setFieldsBeingProcessed(newFieldsBeingProcessed);
    }
    if (newFieldsBeingProcessed.length > 0) {
      let intervalId = setInterval(() => {
        async function getFieldIdsInfo(fieldBundleId) {
          const fieldIdsInfo = await fetchFieldsInfo(fieldBundleId);
          setFieldIdsInfo(fieldIdsInfo);
        }
        fieldBundleId && getFieldIdsInfo(fieldBundleId);
      }, 6000);
      //for cleanup on unmounting of the component
      return () => clearInterval(intervalId);
    }
  }, [fieldIdsInfo, gridApi, fieldBundleId]);

  useEffect(() => {
    if (columnApi && defaultColumns === []) {
      setDefaultColumns(columnApi.getColumnState());
    }
  }, [gridApi, columnApi, defaultColumns]);

  const defaultColDef = {
    // set filtering on for all columns
    // filter: true,
    floatingFilter: gridType === workspaceGrids.EXTRACT,
  };

  const frameworkComponents = {
    linkCellRenderer: WorkspaceGridLinkCellRenderer,
    answerContextCellRenderer: WorkspaceGridAnswerContextCellRenderer,
    passageCellRenderer: PassageCellRenderer,
    dynamicCellRenderer: DynamicCellRenderer,
    passageTooltipRenderer: PassageTooltipRenderer,
    customNoRowsOverlay: CustomNoRowsOverlay,
    numericCellEditor: NumericCellEditor,
    dateCellEditor: DateCellEditor,
    selectCellEditor: SelectCellEditor,
    longTextCellEditor: LongTextCellEditor,
    booleanCellEditor: BooleanCellEditor,
    actionButtonCellRenderer: ActionButtonCellRenderer,
    agPeriodFilter: AgPeriodFilter,
    agDateAsNumberFilter: AgDateAsNumberFilter,
  };

  const onGridReady = async params => {
    setGridApi(params.api);
    setColumnApi(params.columnApi);
  };

  const onColumnGroupOpened = params => {
    params.columnGroup.children[0].colDef.autoHeight = autoHeight;
    params.api.resetRowHeights();
    params.api.refreshCells();
  };

  const onColumnMoved = event => {
    if (event.type === 'columnMoved') {
      // columnMoved is a stream of events which fires while column is being moved
      // so set a flag and then save column order on dragStopped event
      isColumnMovedRef.current = true;
    }
  };

  const onColumnVisible = useCallback(
    ({ visible, column, source }) => {
      if (source === 'toolPanelUi') {
        if (column) {
          if (column.colId && !fieldsSearchQuery) {
            if (visible) {
              setFieldIds([...fieldIds, column.colId]);
            } else {
              setFieldIds(fieldIds.filter(fieldId => fieldId !== column.colId));
            }
          }
        } else {
          // Avoiding infinite rendering in some situations
          // Select/UnSelect All operation
          if (visible) {
            setFieldIds([
              ...new Set([...fieldIds, ...fieldBundles[0].fieldIds]),
            ]);
          } else {
            setFieldIds([]);
          }
        }
      }
    },
    [fieldIds, fieldsSearchQuery]
  );

  const onDragStopped = event => {
    if (event.type === 'dragStopped' && isColumnMovedRef.current) {
      onRearrangeSaveClick();
      isColumnMovedRef.current = false;
    }
  };

  const resetHeightAndWidths = useCallback(
    params => {
      console.log('resetting heights and widths');
      params.api.resetRowHeights();
      if (allColumnDefs.length > 2 && allColumnDefs[1].fieldId === 'Ad hoc') {
        params.api.sizeColumnsToFit();
      } else if (allColumnDefs.length - 1 === fieldIds?.length) {
        autoSizeAllColumns(params.columnApi, false);
      }
    },
    [allColumnDefs, fieldIds?.length]
  );

  // resets the column sizes when switching to the Data tab
  useEffect(() => {
    if (
      activeMenuKey === 'extractions' &&
      !showOnlyFieldId &&
      gridApi &&
      columnApi &&
      !viewIdRef.current
    ) {
      const params = {
        api: gridApi,
        columnApi: columnApi,
      };
      resetHeightAndWidths(params);
    }
  }, [
    activeMenuKey,
    gridApi,
    columnApi,
    resetHeightAndWidths,
    showOnlyFieldId,
  ]);

  const autoSizeAllColumns = (gridColumnApi, skipHeader) => {
    console.debug('autoSizeAllColumns');
    var allColumnIds = [];
    const cols = gridColumnApi.getColumns();
    if (cols) {
      gridColumnApi.getColumns().forEach(function (column) {
        allColumnIds.push(column.colId);
      });
    }
    // Hide columns before resizing to avoid flickering
    gridColumnApi.setColumnsVisible(allColumnIds, false);
    gridColumnApi.autoSizeColumns(allColumnIds, skipHeader);
    gridColumnApi.setColumnsVisible(allColumnIds, true);
  };

  const [showRenameFieldModal, setShowRenameFieldModal] = useState(false);
  const [showCloneFieldsModal, setShowCloneFieldsModal] = useState(false);

  const [showFieldContextModal, setShowFieldContextModal] = useState(false);
  const [field, setField] = useState(null);

  const handleFieldRename = fieldDefinition => {
    setFieldToBeRenamed(fieldDefinition);
    setShowRenameFieldModal(true);
  };

  const [fieldToBeCloned, setFieldToBeCloned] = useState('');
  const handleFieldClone = fieldDefinition => {
    setFieldToBeCloned(fieldDefinition);
    setShowCloneFieldsModal(true);
  };

  const isVisualizationIncluded = () => {
    return (
      userInfo &&
      userInfo?.includedFeatures &&
      userInfo?.includedFeatures.indexOf('visualization') != -1
    );
  };
  const getMainMenuItems = params => {
    const fieldDefinition = params.column.colDef.fieldDefinition;
    const { fieldId, fieldName } = params.column.colDef;
    // params.defaultItems = [];
    const defaultItems = params.defaultItems.slice(0);
    defaultItems.push('separator');

    if (!showOnlyFieldId && isAllowedToCreateField()) {
      defaultItems.push({
        name: 'Rename Field',
        action: async function () {
          handleFieldRename(fieldDefinition);
        },
      });

      if (fieldDefinition.isEnteredField && !fieldDefinition.isDependentField) {
        defaultItems.push({
          name: 'Edit Field',
          action: async function () {
            history.push({
              pathname: `${url}/workflowFields/${fieldId}`,
            });
          },
        });
      }

      if (fieldDefinition.isDependentField) {
        defaultItems.push({
          name: 'Edit Field',
          action: async function () {
            history.push({
              pathname: `${url}/derivedFields/${fieldId}`,
            });
          },
        });
      }

      defaultItems.push({
        name: 'Delete Field',
        action: async function () {
          setFieldToBeDeleted({
            id: fieldId,
            name: fieldName,
          });
          setShowDeleteFieldModal(true);
        },
      });
      defaultItems.push('separator');
    }

    defaultItems.push({
      name: 'Clone Field',
      action: async function () {
        handleFieldClone(fieldDefinition);
      },
    });

    if (
      !showOnlyFieldId &&
      !fieldDefinition.isEnteredField &&
      isAllowedToCreateField()
    ) {
      defaultItems.push({
        name: 'Refine Field',
        action: async function () {
          history.push({
            pathname: `${url}/dataFields/refine/${fieldId}`,
            state: { from: `${url}/data` },
          });
        },
      });

      defaultItems.push({
        name: 'View Field Definition',
        action: async function () {
          setLoading(true);
          await getFieldDefinition(fieldId, setFieldEditData);
          setFieldEditorVisible(true);
          setLoading(false);
        },
      });

      defaultItems.push({
        name: 'View Field Context',
        action: async function () {
          setShowFieldContextModal(true);
          setField({
            id: fieldId,
            name: fieldName,
          });
        },
      });
    }

    if (!showOnlyFieldId && !fieldDefinition.isEnteredField) {
      const dataType = getDataType(fieldDefinition, fieldDefinition.options);
      if (
        isVisualizationIncluded() &&
        (dataType === dataTypes.BOOLEAN ||
          dataType === dataTypes.NUMBER ||
          dataType === dataTypes.MONEY ||
          dataType === dataTypes.TEXT)
      ) {
        defaultItems.push({
          name: 'Analyze Field',
          action: async function () {
            setVisualizeFieldId(fieldId);
            setVisualizeFieldName(fieldName);
            setChartType(getChartType({ dataType }));
            setShowVisualization(true);
            setViewOnly(true);
          },
        });
      }
    }
    return defaultItems;
  };

  const handleEmptyAndNullValuesInFilterValues = distinctValues => {
    return distinctValues?.flatMap(value => {
      // Handle '' and null values in filters. See: getMoreData function
      if (value === '') {
        return ['+'];
      }
      if (value === null) {
        return ['-'];
      }
      return [value];
    });
  };
  const createColumnDefs = (field, expand) => {
    const getFilterValues = async ({ success, api, colDef }) => {
      const gridState = gridStateRef.current;
      if (api.isAnyFilterPresent() && gridState) {
        const getFilterOptions = async fieldId => {
          const filterModel = handleEmptyAndNullValues(
            gridState.gridQuery.filterModel
          );
          const response = await fetchFilterOptions({
            fieldId,
            gridState: {
              ...gridState,
              gridQuery: {
                ...gridState.gridQuery,
                filterModel,
              },
            },
          });
          return response?.data;
        };
        const filterOptions = await getFilterOptions(colDef.field);
        success(handleEmptyAndNullValuesInFilterValues(filterOptions));
      } else {
        const fieldMetaData = await fetchFieldMetaData(colDef.field);
        success(
          handleEmptyAndNullValuesInFilterValues(fieldMetaData?.distinctValues)
        );
      }
    };
    let floatingFilterComponent;
    var isNumericField =
      field.dataType === 'number' ||
      field?.options?.parent_type === 'NUM' ||
      (field?.searchCriteria?.post_processors?.flat()?.length &&
        field.searchCriteria.post_processors
          ?.flat()[0]
          ?.startsWith('NumberFormatter'));
    var colType = isNumericField ? 'numericColumn' : null;
    var cellClass = ['cell-wrap-text', 'grid-col'];
    var filter = 'agSetColumnFilter';
    var filterParams = {
      values: getFilterValues,
      refreshValuesOnOpen: true,
      buttons: ['apply', 'reset'],
      closeOnApply: true,
    };
    let dataType = getDataType(field, field.options);
    let answerType = null;
    let answerParentType = null;
    let chartDataType = 'excluded';
    let enableValue = false;
    let enablePivot = false;
    let isGroupedField = false;
    if (
      field.searchCriteria &&
      field.searchCriteria.criterias &&
      field.searchCriteria.criterias.length > 0
    ) {
      isGroupedField = field.searchCriteria.criterias[0].groupFlag === 'enable';
    }
    if (field.options && field.options.answer_type) {
      answerType = field.options.answer_type;
    } else if (
      field.searchCriteria &&
      field.searchCriteria.criterias &&
      field.searchCriteria.criterias.length > 0
    ) {
      answerType = field.searchCriteria.criterias[0].expectedAnswerType;
    }
    if (answerType) {
      answerParentType = answerType.split(':')[0];
    }
    if (dataType === dataTypes.NUMBER || dataType === dataTypes.MONEY) {
      cellClass = [
        'ag-right-aligned-cell',
        'cell-wrap-text-right-align',
        'grid-col',
      ];
      chartDataType = 'series';
      enableValue = true;
    }
    if (dataType === dataTypes.MONEY || dataType === dataTypes.NUMBER) {
      filter = 'agNumberColumnFilter';
    }
    if (dataType === dataTypes.PERIOD) {
      filter = 'agPeriodFilter';
      floatingFilterComponent = AgPeriodFilterFloatingComponent;
    }
    if (dataType === dataTypes.DATE) {
      filter = 'agDateAsNumberFilter';
      floatingFilterComponent = AgPeriodFilterFloatingComponent;
      chartDataType = 'category';
    }
    if (
      dataType === dataTypes.BOOLEAN ||
      (field.isEnteredField &&
        (dataTypes.TEXT === dataType ||
          (dataTypes.LIST === dataType &&
            field?.options.selectionType === 'single'))) ||
      (answerParentType &&
        categoricalAnswerTypes.indexOf(answerParentType) != -1)
    ) {
      chartDataType = 'category';
      enablePivot = true;
    }

    var cellStyle = {};
    if (!expand) {
      return [
        {
          hide: !fieldIds.includes(field.id),
          pinned: field.pinned,
          ...(showOnlyFieldId
            ? { width: 200, maxWidth: 200 }
            : { minWidth: 100, maxWidth: 270 }),
          headerName: field.name,
          colId: field.id,
          fieldDefinition: field,
          fieldId: field.id,
          field: field.id,
          fieldName: field.name,
          headerTooltip: field.name,
          type: colType,
          valueGetter: createValueGetter(field),
          filterValueGetter: createValueGetter(field),
          sortable: !isGroupedField,
          resizable: true,
          enablePivot: enablePivot && !isGroupedField,
          enableValue: enableValue && !isGroupedField,
          // rowGroup: enablePivot,
          enableRowGroup: enablePivot && !isGroupedField,
          isEnteredField: field.isEnteredField,
          singleClickEdit: false,
          editable: false,
          valueSetter: valueSetter, //field.isEnteredField ? valueSetter : undefined,
          cellEditor: getCellEditor(field),
          cellEditorParams: getCellEditorParams(field),
          cellClass: cellClass,
          cellClassRules: statusCellStyleRules,
          cellStyle: cellStyle,
          cellRenderer: 'dynamicCellRenderer',
          cellRendererParams: {
            hideMenu: field.isDependentField,
            showMenuOnClick: !field.isEnteredField,
            showSearchResult: true,
            fieldBundleId: fieldBundleId,
            getViewId: () => viewIdRef.current,
            from: 'extractions',
            onOpen: function (params) {
              let currentRowData = params.node.data;
              let fieldName = replaceFieldSuffix(params.colDef.field);
              let fieldValue = params.node.data[fieldName];
              fieldValue.fieldId = params.colDef.fieldId;
              fieldValue.field = fieldName;
              fieldValue.fieldName = params.colDef.fieldName;
              setClickedDocId(currentRowData.file_idx);
              setClickedField(fieldValue);
              setDetailVisible(true);
            },
            onEdit: function (params) {
              params.api.startEditingCell({
                rowIndex: params.rowIndex,
                colKey: params.colDef,
              });
            },
          },
          autoHeight: autoHeight,
          filter: !isGroupedField ? filter : undefined,
          floatingFilter:
            gridType === workspaceGrids.EXTRACT && !isGroupedField,
          ...(floatingFilterComponent && { floatingFilterComponent }),
          filterParams: filterParams,
          chartDataType: chartDataType,
          // un comment for hover
          // tooltipField: field.name,
          // tooltipComponent: 'passageTooltipRenderer'
        },
      ];
    }
    let colDefs = [
      {
        minWidth: 300,
        maxWidth: 350,
        headerName: 'Best Passage',
        field: field.name + '_passage',
        fieldId: field.id,
        sortable: true,
        cellClass: ['cell-wrap-text', 'grid-col'],
        autoHeight: autoHeight,
        resizable: true,
        icons: { menu: '<i class="\f338"/>' },
        filter: 'agTextColumnFilter',
        cellRenderer: 'passageCellRenderer',
        cellClassRules: statusCellStyleRules,
        valueGetter: createValueGetter(field, viewFields.MATCH),
      },
      {
        minWidth: 200,
        maxWidth: 300,
        headerName: 'Best Answer',
        icons: { menu: '<i class="\f338"/>' },
        field: field.name + '_formatted_answer',
        fieldId: field.id,
        fieldDefinition: field,
        sortable: true,
        cellClass: ['cell-wrap-text', 'grid-col'],
        autoHeight: autoHeight,
        flex: 1,
        type: colType,
        cellStyle: {
          fontWeight: 'bold',
          textAlign: isNumericField ? 'right' : 'left',
        },
        cellRenderer: 'dynamicCellRenderer',
        cellRendererParams: { hideMenu: true },
        valueGetter: createValueGetter(field),
      },
      {
        minWidth: 200,
        maxWidth: 200,
        headerName: 'Header',
        icons: { menu: '<i class="\f338"/>' },
        field: field.name + '_header_text',
        fieldId: field.id,
        sortable: true,
        cellClass: ['cell-wrap-text', 'grid-col'],
        autoHeight: autoHeight,
        flex: 1,
        type: colType,
        cellRenderer: 'dynamicCellRenderer',
        cellRendererParams: { hideMenu: true },
        valueGetter: createValueGetter(field, viewFields.HEADER_TEXT),
      },
      {
        minWidth: 130,
        headerName: 'Score',
        icons: { menu: '<i class="\f338"/>' },
        field: field.name + '_scr',
        fieldId: field.id,
        sortable: true,
        maxWidth: 130,
        type: 'numericColumn',
        cellClassRules: statusCellStyleRules,
        cellStyle: { direction: 'rtl' },
        valueGetter: createNumericValueGetter(
          field.name,
          viewFields.SCALED_SCORE
        ),
      },
      {
        minWidth: 130,
        headerName: '',
        icons: { menu: '<i class="\f338"/>' },
        field: field.name + '_action',
        fieldId: field.id,
        maxWidth: 130,
        type: 'numericColumn',
        cellRenderer: 'actionButtonCellRenderer',
      },
    ];
    return [
      {
        headerName: field.name === 'Ad hoc' ? '' : field.name,
        openByDefault: false,
        children: colDefs,
      },
    ];
  };

  const setSideBarVisibility = checked => {
    setDetailVisible(checked);
    setSplitMode(checked);
  };

  const rerunExtraction = async () => {
    async function getFieldIdsInfo(fieldBundleId) {
      const fieldIdsInfo = await fetchFieldsInfo(fieldBundleId);
      setFieldIdsInfo(fieldIdsInfo);
    }
    fieldBundleId && getFieldIdsInfo(fieldBundleId);
    setTimeout(() => {
      setLoading(true);
      gridApi?.refreshServerSide();
      setLoading(false);
    });
  };

  const onRerunClick = () => {
    if (fieldBundles?.length) {
      rerunExtraction();
    }
  };

  const renderGrid = useCallback(() => {
    if (!fieldIds?.length) {
      return;
    }
    console.debug('rendering grid..');
    if (fieldBundleId !== undefined) {
      // latch render bundle key
      workspaceContext.setRenderedBundleKey(fieldBundleId);
      workspaceContext.setSavedBundleId(fieldBundleId);
    }
    const nameColDef = [
      {
        headerName: 'File',
        field: 'file_name',
        pinned: 'left',
        filter: true,
        sortable: true,
        floatingFilter: false,
        resizable: true,
        icons: { menu: '<i class="\f338"/>' },
        ...(showOnlyFieldId
          ? { minWidth: 150, width: 150, maxWidth: 320 }
          : { minWidth: 220, maxWidth: 320 }),
        suppressSizeToFit: true,
        showRowGroup: true,
        cellRenderer: 'agGroupCellRenderer',
        cellRendererParams: {
          innerRenderer: 'linkCellRenderer',
          fieldBundleId,
          onDocumentDelete: deletedDocId => {
            deletedDocId &&
              history.push({
                pathname: url,
                state: { refreshDataGrid: deletedDocId },
              });
          },
          getViewId: () => viewIdRef.current,
        },
        tooltipField: 'file_name',
        cellStyle: { textAlign: 'left' },
      },
    ];
    let defs = nameColDef;
    let fieldList = [];
    let enteredFieldIds = [];
    const gridFieldIds = showOnlyFieldId
      ? [showOnlyFieldId]
      : // Making sure the order of fields is preserved as per the order in view
        // and the visible columns in a view (fieldIds) are at the top.
        [...new Set([...fieldIds, ...fieldBundles[0].fieldIds])];
    for (const fieldId of gridFieldIds) {
      const field = fieldsMetaData.find(({ id }) => id === fieldId);
      if (field) {
        defs = defs.concat(createColumnDefs(field));
        fieldList.push(field);
        expandedColDefs[field.id] = nameColDef.concat(
          createColumnDefs(field, true)
        );
        if (field.isEnteredField) {
          enteredFieldIds.push(field.id);
        }
      }
    }
    if (showOnlyFieldId) {
      const fieldMetaData = fieldsMetaData.find(
        ({ id }) => id === showOnlyFieldId
      );
      if (fieldMetaData) {
        const { searchCriteria, name: fieldName } = fieldMetaData;
        defs.push({
          headerName: 'Context',
          field: showOnlyFieldId,
          filter: false,
          sortable: false,
          floatingFilter: false,
          resizable: false,
          autoHeight: false,
          flex: 3,
          suppressSizeToFit: true,
          cellRenderer: 'answerContextCellRenderer',
          cellRendererParams: {
            fieldId: showOnlyFieldId,
            fieldName,
            workspaceId,
            searchCriteria,
          },
        });
      }
    }

    setAllColumnDefs(defs);

    if (gridApi) {
      gridApi.setColumnDefs(defs);
      if (defs.length === 2 && defs[1].field === 'Ad hoc') {
        gridApi.setColumnDefs(expandedColDefs[defs[1].field]);
      } else {
        gridApi.setColumnDefs(defs);
      }

      if (defs.length <= 5) {
        gridApi.sizeColumnsToFit();
      }
    }
  }, [
    fieldsMetaData,
    gridApi,
    fieldBundleId,
    fieldIds,
    showOnlyFieldId,
    fieldBundles,
  ]);

  useEffect(() => {
    const gridHorizontalScrollElement = document.querySelector(
      '.nlm-workspaceGrid .ag-body-horizontal-scroll-viewport'
    );
    const scrollLeft = gridHorizontalScrollElement?.scrollLeft;

    gridApi &&
      fieldsMetaData?.length &&
      fieldBundles?.length &&
      fieldIds?.length &&
      renderGrid();

    requestAnimationFrame(() => {
      if (gridHorizontalScrollElement) {
        gridHorizontalScrollElement.scrollLeft = scrollLeft;
      }
    });
  }, [fieldsMetaData, fieldBundles, renderGrid, gridApi, fieldIds]);

  // Saves the new field order
  // Doesn't save unless all of the columns are visible
  const onRearrangeSaveClick = async () => {
    if (columnApi) {
      let fieldIds = [];
      let currentCols = columnApi.getColumnState();
      let allColsVis = currentCols.every(col => {
        return col.hide === false;
      });
      if (allColsVis) {
        for (let col of currentCols) {
          if (
            col.colId &&
            !col.colId.startsWith('file_name') &&
            col.colId.indexOf('ag-Grid') === -1
          ) {
            fieldIds.push(col.colId);
          }
        }
        let fieldBundle = {};
        fieldBundle['fieldIds'] = fieldIds;
        gridApi?.showLoadingOverlay();
        await saveFieldBundle(user, fieldBundleId, fieldBundle);
        const fieldBundles = await fetchFieldBundles(workspaceId);
        setFieldBundles(fieldBundles);
        setFieldIds(fieldBundles[0].fieldIds);
        // In All Data Fields tab fields are displayed in the order of fields in fieldIds inside a fieldBundle.
        // So refetch field bundles so that correct order is displayed in All Data Fields tab.
        refetchFieldBundles(workspaceId);
        gridApi?.hideOverlay();
        message.info('Field order saved successfully.');
      } else {
        if (viewIdRef.current) {
          message.warning('Save view to preserve the new column order.');
        } else {
          message.warning('Cannot save order when columns are filtered.');
        }
      }
    }
  };

  const menuKeys = {
    compareDocuments: 'compare-documents',
    showEditStatistics: 'show-edit-statistics',
    cloneFieldSet: 'clone-field-set',
    saveFieldOrder: 'save-field-order',
    rerunFieldExtraction: 'rerun-field-extraction',
  };
  const getMenu = () => {
    const menu = [];

    if (fieldBundleId) {
      if (fieldBundles.length) {
        menu.push({
          key: menuKeys.compareDocuments,
          label: 'Compare Documents',
          icon: <SwapOutlined />,
          disabled: loading,
        });
      }
      menu.push({
        key: menuKeys.showEditStatistics,
        label: 'Show Edit Statistics',
        icon: <FundProjectionScreenOutlined />,
        disabled: !fieldsMetaData?.length,
      });
      if (fieldBundles.length) {
        menu.push({
          key: menuKeys.cloneFieldSet,
          label: 'Clone Field Set',
          icon: <CopyOutlined />,
        });
      }
      menu.push({
        key: menuKeys.saveFieldOrder,
        label: 'Save Field Order',
        icon: <SaveOutlined />,
      });
    }
    if (
      workspaceContext.currentWorkspace &&
      userInfo &&
      (userInfo?.id === workspaceContext.currentWorkspace.userId ||
        userInfo?.isAdmin)
    ) {
      menu.push({
        key: menuKeys.rerunFieldExtraction,
        label: 'Rerun Field Extraction',
        icon: <RedoOutlined />,
      });
    }
    return menu;
  };

  const onMenuClick = ({ key }) => {
    switch (key) {
      case menuKeys.compareDocuments:
        setCompareVisible(true);
        break;
      case menuKeys.showEditStatistics:
        setEditStatsVisible(true);
        break;
      case menuKeys.cloneFieldSet:
        setCloneFieldSetVisible(true);
        break;
      case menuKeys.saveFieldOrder:
        onRearrangeSaveClick();
        break;
      case menuKeys.rerunFieldExtraction:
        onRerunClick();
        break;
    }
  };

  const processCellForClipboard = params => {
    return params.value;
  };

  useEffect(() => {
    if (gridType === workspaceGrids.EXTRACT) {
      const fieldValueEditData = workspaceContext.fieldValueEditData;
      if (fieldValueEditData && fieldValueEditData.fieldValue) {
        if (gridApi && Object.keys(fieldValueEditData.fieldValue).length > 0) {
          gridApi.forEachNode(node => {
            if (!node.group) {
              if (node.data.file_idx === fieldValueEditData.fileId) {
                node.setDataValue(
                  fieldValueEditData.fieldId,
                  fieldValueEditData.fieldData
                );
              }
            }
          });
        }
      }
    }
  }, [workspaceContext.fieldValueEditData]);

  const onCellEditingStarted = params => {
    setCellValueBeforeEdit({
      fieldId: params.colDef.fieldId,
      value: params.value,
    });
  };
  const onCellEditingStopped = params => {
    let newValue = params.colDef.valueGetter(params, true);
    if (
      cellValueBeforeEdit &&
      cellValueBeforeEdit.fieldId === params.colDef.fieldId &&
      cellValueBeforeEdit.value !== newValue
    ) {
      let fieldValue = {
        docId: params.data.file_idx,
        fieldId: params.colDef.fieldId,
        fieldBundleId: fieldBundleId,
        workspaceId: workspaceId,
        selectedRow: {
          answer: newValue,
          formatted_answer: newValue,
          answer_details: params.data[params.colDef.field].answer_details,
          type: 'override',
          match_idx: 'manual',
          is_override: true,
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
          source: fieldEditSources.WORKSPACE_GRID,
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
      } finally {
        setLoading(false);
      }
    }
  };

  const onRangeSelectionChanged = params => {
    const cellRanges = params.api.getCellRanges();
    const selectedCells = cellRanges.flatMap(
      ({
        columns,
        startRow: { rowIndex: startRowIndex },
        endRow: { rowIndex: endRowIndex },
      }) => {
        const selectedCells = [];
        for (
          let rowIndex = startRowIndex;
          rowIndex <= endRowIndex;
          rowIndex++
        ) {
          const rowNode = params.api.getRowNode(String(rowIndex));

          columns.forEach(({ colDef }) => {
            if (
              colDef &&
              colDef.field !== 'file_name' &&
              !colDef.isEnteredField
            ) {
              let currentRowData = rowNode.data;

              let fieldName = replaceFieldSuffix(colDef.fieldName);
              let fieldValue = currentRowData[colDef.fieldId];
              if (fieldValue) {
                fieldValue.fieldId = colDef.fieldId;
                fieldValue.fieldName = fieldName;
              }

              let selectedNode = {
                docId: currentRowData.file_idx,
                fieldData: fieldValue,
                docName: currentRowData.file_name,
                fieldName: colDef.fieldName,
              };
              selectedCells.push(selectedNode);
            }
          });
        }
        return selectedCells;
      }
    );
    setSelectedCells(selectedCells);
  };

  const getContextMenuItems = () => {
    return [
      {
        name: 'Compare',
        action: function () {
          setCompareVisible(true);
        },
        cssClasses: ['redFont', 'bold'],
      },
      'copy',
      'copyWithHeaders',
      'export',
      'chartRange',
    ];
  };

  const updateGrid = useCallback(
    ({ columnState, filterModel, viewId }) => {
      if (columnApi && gridApi) {
        // First hide all columns
        const currentColumnState = columnApi?.getColumnState();
        columnApi?.applyColumnState({
          state: currentColumnState.map(columnState => ({
            ...columnState,
            hide: true,
          })),
          applyOrder: true,
        });
        // Now show columns based on saved view state
        columnApi?.applyColumnState({
          state: columnState,
          applyOrder: true,
        });
        gridApi?.setFilterModel(filterModel);
        // Slice out first FileName Column
        setFieldIds(columnState.map(({ colId }) => colId).slice(1));
        setViewId(viewId);
      }
    },
    [gridApi, columnApi]
  );

  const handleChange = useCallback(
    debounce(({ query, columnApi }) => {
      filterColumns({ query, columnApi });
    }, 300),
    []
  );

  const dataHeader = (
    <Row>
      <Col span={24}>
        <Card bordered={false} bodyStyle={{ padding: 0, marginBottom: '10px' }}>
          <Row
            wrap={false}
            justify="space-between"
            style={{
              width: '100%',
              padding: '10px',
            }}
          >
            <Col>
              <Row gutter={[10, 10]}>
                {isAllowedToCreateField() && (
                  <Col>
                    <Button
                      shape="circle"
                      type="primary"
                      title="Create new field"
                      icon={<PlusOutlined></PlusOutlined>}
                      onClick={() => {
                        clearWorkspaceSearchCriteria(workspaceContext);
                        clearWorkspaceSearchResults(workspaceContext);
                        workspaceContext.setFieldEditData(null);
                        history.push({
                          pathname: `${url}/dataFields/new`,
                          state: {
                            from: `${url}/data`,
                          },
                        });
                      }}
                    ></Button>
                  </Col>
                )}
                <Col>
                  <Input
                    style={{ marginRight: 20, width: '100%' }}
                    allowClear
                    autoFocus
                    placeholder="Search fields"
                    addonBefore={<SearchOutlined />}
                    onChange={event => {
                      event.persist();
                      setFieldsSearchQuery(event.target.value);
                      handleChange({ query: event.target.value, columnApi });
                    }}
                  />
                </Col>
              </Row>
            </Col>
            <Col span={6}>
              <WorkspaceGridViewManager
                getColumnState={() =>
                  columnApi.getColumnState().filter(({ hide }) => !hide)
                }
                getFilterModel={() => gridApi.getFilterModel()}
                workspaceId={workspaceId}
                fieldSetId={fieldBundleId}
                userId={userInfo?.id}
                updateGrid={gridApi && columnApi && updateGrid}
                resetGrid={() => {
                  gridApi.setFilterModel(null);
                  columnApi.resetColumnState();
                  setViewId(null);
                  if (fieldBundles?.length) {
                    setFieldIds([...fieldBundles[0]?.fieldIds]);
                  }
                }}
              />
            </Col>
            <Col>
              {!!fieldBundles.length && !isViewerRole() && (
                <Tooltip title="Note: This will download extracted data from all the files">
                  <Button
                    icon={<DownloadOutlined></DownloadOutlined>}
                    onClick={() => {
                      downloadAllData({
                        workspaceId,
                        fieldBundleId,
                        workspaceName: workspaceContext.currentWorkspaceName,
                        fieldBundleName: fieldBundles?.find(
                          ({ id }) => id === fieldBundleId
                        )?.bundleName,
                      });
                    }}
                  />
                </Tooltip>
              )}
            </Col>
            {isVisualizationIncluded() && (
              <Col>
                <Button
                  onClick={() => {
                    const rowGroupCols = columnApi?.getRowGroupColumns();
                    const valueCols = columnApi?.getValueColumns();
                    const chartType = getChartType({ rowGroupCols, valueCols });
                    if (chartType) {
                      setChartType(chartType);
                      setShowVisualization(true);
                      setVisualizeFieldId(null);
                      setVisualizeFieldName('');
                      setViewOnly(false);
                    } else {
                      message.info('Group by some field to analyze data.');
                    }
                  }}
                >
                  Analyze Data
                </Button>
              </Col>
            )}
            <Col>
              {!!fieldsBeingProcessed.length && (
                <Tooltip
                  title={
                    'Processing: ' +
                    fieldsBeingProcessed.map(field => field.name).join(', ')
                  }
                >
                  <div>
                    <Alert
                      message={
                        <>
                          <span>Processing: </span>
                          <Badge count={fieldsBeingProcessed.length} />
                          <span> field(s)</span>
                        </>
                      }
                      banner
                    />
                  </div>
                </Tooltip>
              )}
            </Col>
            <Col span={3}>
              <WorkspaceGridReviewStatusFilter
                reviewStatusFilterChanged={reviewStatusFilter => {
                  setReviewStatusFilter(reviewStatusFilter);
                }}
                fields={fieldsMetaData
                  ?.filter(({ isEnteredField }) => !isEnteredField)
                  .map(({ id, name }) => ({ id, name }))}
              />
            </Col>
            <Col span={2}>
              <Row align="middle" justify="space-between">
                <Col>
                  <Tooltip title="Keep right side bar open to show other potential answers when a value is selected">
                    <Switch
                      unCheckedChildren={<SplitCellsOutlined />}
                      size="small"
                      onChange={setSideBarVisibility}
                      checkedChildren={<SplitCellsOutlined />}
                      checked={splitMode}
                    ></Switch>
                  </Tooltip>
                </Col>
                <Col>
                  <Button
                    icon={<FilterOutlined />}
                    onClick={() => setShowSideBar(!showSideBar)}
                    type="text"
                  ></Button>
                </Col>
                <Col>
                  <Dropdown
                    style={{ 'top-margin': '5%' }}
                    menu={{ items: getMenu(), onClick: onMenuClick }}
                    trigger={['click']}
                  >
                    <Button type="link" icon={<MoreOutlined />} />
                  </Dropdown>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );

  // Submits the clone field set form, then opens the target workspace
  const submitClone = async values => {
    await cloneFieldSet(values.fieldSet, values.workspace);
    setCloneFieldSetVisible(false);
    // if cloning to the same workspace
    if (values.workspace === workspaceId) {
      const fieldBundles = await fetchFieldBundles(workspaceId);
      setFieldBundles(fieldBundles);
    } else {
      const chosenWorkspace = workspaceContext.workspaces.find(workspace => {
        return workspace.id === values.workspace;
      });
      history.push(`/workspace/${chosenWorkspace.id}/documents`);
    }
  };

  const showResult =
    gridType === workspaceGrids.EXTRACT && !clickedField && splitMode ? (
      <Result
        title="Potential Answers"
        subTitle="Click on a cell to view all potential answers here"
      ></Result>
    ) : (
      ''
    );

  const noRowsOverlayComponent = useMemo(() => {
    return WorkspaceGridNoRowsOverlay;
  }, []);
  const noRowsOverlayComponentParams = useMemo(() => {
    return {
      isFilterApplied: isFilterApplied || !!reviewStatusFilter,
    };
  }, [reviewStatusFilter, isFilterApplied]);

  const loadingOverlayComponent = useMemo(() => {
    return WorkspaceGridLoadingOverlay;
  }, []);

  const onFilterChanged = useCallback(() => {
    setIsFilterApplied(gridApi?.isAnyFilterPresent());
  }, [gridApi]);

  return (
    <Layout style={{ marginLeft: 0, marginRight: 0 }}>
      <>
        {!showOnlyFieldId && dataHeader}
        {fieldsMetaData?.length ? (
          <Row>
            <Col
              span={splitMode || detailVisible ? 18 : 24}
              className="nlm-workspaceGrid"
            >
              <AgGridWrapper height={tableHeight}>
                <AgGrid
                  rowModelType="serverSide"
                  getChildCount={getChildCount}
                  key={gridType + '-grid'}
                  rowSelection="multiple"
                  enableRangeSelection
                  enableCharts
                  suppressColumnVirtualisation
                  suppressRowHoverHighlight
                  suppressRowClickSelection
                  getContextMenuItems={getContextMenuItems}
                  stopEditingWhenCellsLoseFocus={true}
                  headerHeight={35}
                  rowBuffer={25}
                  groupDisplayType={'custom'}
                  editable={true}
                  groupHeaderHeight={0}
                  defaultColDef={defaultColDef}
                  sideBar={showSideBar}
                  onGridReady={onGridReady}
                  processCellForClipboard={processCellForClipboard}
                  frameworkComponents={frameworkComponents}
                  getMainMenuItems={getMainMenuItems}
                  toolPanel="columns"
                  setPopupParent={[]}
                  tooltipShowDelay={0}
                  onCellEditingStarted={onCellEditingStarted}
                  onCellEditingStopped={onCellEditingStopped}
                  onColumnGroupOpened={onColumnGroupOpened}
                  onColumnMoved={onColumnMoved}
                  onColumnVisible={onColumnVisible}
                  onDragStopped={onDragStopped}
                  rowHeight={showOnlyFieldId ? 200 : 80}
                  pagination={true}
                  paginationPageSize={20}
                  cacheBlockSize={20}
                  serverSideInfiniteScroll={true}
                  enableBrowserTooltips={false}
                  suppressMenuHide={true}
                  context={{
                    workspaceContext,
                  }}
                  onRangeSelectionChanged={onRangeSelectionChanged}
                  overlayLoadingTemplate={
                    '<div class="ant-spin-nested-loading"><div><div class="ant-spin ant-spin-lg ant-spin-spinning ant-spin-show-text"><span class="ant-spin-dot ant-spin-dot-spin"><i class="ant-spin-dot-item"></i><i class="ant-spin-dot-item"></i><i class="ant-spin-dot-item"></i><i class="ant-spin-dot-item"></i></span></div></div>'
                  }
                  floatingFilterComponentParams={
                    gridType === workspaceGrids.EXTRACT
                  }
                  noRowsOverlayComponent={noRowsOverlayComponent}
                  noRowsOverlayComponentParams={noRowsOverlayComponentParams}
                  loadingOverlayComponent={loadingOverlayComponent}
                  onFilterChanged={onFilterChanged}
                />
              </AgGridWrapper>
            </Col>
            {(splitMode || detailVisible) && (
              <Col span={6}>
                {clickedField && detailVisible ? (
                  <DetailSider
                    editedField={clickedField}
                    setDetailVisible={setSideBarVisibility}
                    visible={detailVisible}
                    resultHandler={result => {
                      goToFileSearch(user, workspaceContext, {
                        fileIdx: clickedDocId,
                      });
                      workspaceContext.setWorkspaceEditedFieldId(
                        clickedField.fieldId
                      );
                      workspaceContext.setWorkspaceSearchSelectedResult(result);
                    }}
                    docId={clickedDocId}
                    sourceComponent="workspaceGrid"
                    fieldBundleId={fieldBundleId}
                    workspaceId={workspaceId}
                    siderHeight={315}
                  />
                ) : (
                  showResult
                )}
              </Col>
            )}
          </Row>
        ) : (
          <Row>
            <Col flex="auto">
              {isFetchingFieldsMetaData ? (
                <Spin style={{ width: '100%', lineHeight: 30 }} />
              ) : (
                <NoFieldsMessage
                  createNewFieldUrl={`${url}/dataFields/new`}
                  redirectPostCreationUrl={`${url}/data`}
                  isAllowedToCreateField={isAllowedToCreateField()}
                />
              )}
            </Col>
          </Row>
        )}
      </>

      {fieldEditData && (
        <Modal
          title={fieldEditData ? fieldEditData.name : 'fieldName'}
          open={fieldEditorVisible}
          footer={null}
          width="45vw"
          bodyStyle={{
            height: 'min-content',
            maxHeight: '75vh',
            overflow: 'auto',
          }}
          destroyOnClose
          onCancel={() => setFieldEditorVisible(false)}
        >
          {fieldEditData.isEnteredField ? (
            <WorkflowFieldEditor
              workspaceId={fieldEditData.workspaceId}
              parentBundleId={fieldEditData.parentBundleId}
              fieldEditData={fieldEditData}
            ></WorkflowFieldEditor>
          ) : (
            <SearchCriteriaViewer
              fieldDefinition={fieldEditData.searchCriteria}
            ></SearchCriteriaViewer>
          )}
        </Modal>
      )}
      <Modal
        title="Compare"
        open={compareVisible}
        width="80vw"
        onCancel={() => setCompareVisible(false)}
      >
        <div style={{ height: '60vh', overflow: 'auto' }}>
          <ComparisionViewer
            fieldBundleId={fieldBundleId}
            comparisonData={selectedCells}
          ></ComparisionViewer>
        </div>
      </Modal>

      {/* The modal that allows a user to clone a field set into another workspace */}
      <Modal
        title="Clone Field Set"
        open={cloneFieldSetVisible}
        onCancel={() => {
          setCloneFieldSetVisible(false);
        }}
        footer={[
          <Button form="cloneForm" key="submit" htmlType="submit">
            Submit
          </Button>,
        ]}
      >
        <Form id="cloneForm" name="clone" onFinish={submitClone}>
          <Form.Item
            label="Field Set"
            name="fieldSet"
            rules={[
              { required: true, message: 'Please select a field set to clone' },
            ]}
          >
            <Select>
              {fieldBundles.length &&
                fieldBundles.map(fieldSet => (
                  <Option
                    value={fieldSet.id}
                    key={fieldSet.id}
                    name={fieldSet.bundleName}
                  >
                    {fieldSet.bundleName}
                  </Option>
                ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Target Workspace"
            name="workspace"
            rules={[
              {
                required: true,
                message: 'Please select a workspace to add cloned field set to',
              },
            ]}
          >
            <Select showSearch optionFilterProp="name">
              {workspaceContext.workspaces.length &&
                workspaceContext.workspaces.map(workspace => (
                  <Option
                    value={workspace.id}
                    key={workspace.id}
                    name={workspace.name}
                  >
                    {workspace.name}
                  </Option>
                ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      {gridType === workspaceGrids.EXTRACT && (
        <Modal open={gridDataFilterVisible}>
          <GridDataFilter></GridDataFilter>
        </Modal>
      )}

      {showRenameFieldModal && (
        <WorkspaceGridRenameFieldModal
          fieldToBeRenamed={fieldToBeRenamed}
          hideModal={() => {
            setShowRenameFieldModal(false);
          }}
          renameField={renameFieldMutation.mutateAsync}
          onRenameCallback={onRenameCallback}
        />
      )}
      {showDeleteFieldModal && (
        <WorkspaceGridDeleteFieldModal
          fieldToBeDeleted={fieldToBeDeleted}
          hideModal={() => {
            setShowDeleteFieldModal(false);
          }}
          deleteField={deleteFieldMutation.mutateAsync}
          onDeleteCallback={onDeleteCallback}
        />
      )}
      {showCloneFieldsModal && (
        <WorkspaceGridCloneFieldsModal
          fieldToBeCloned={fieldToBeCloned}
          fieldBundleId={fieldBundleId}
          workspaces={workspaceContext.workspaces}
          hideModal={() => setShowCloneFieldsModal(false)}
          workspaceId={workspaceId}
          onFieldClone={({
            clonedFieldId,
            targetWorkspaceId,
            targetFieldBundleId,
            isCloneAndRedirect,
          }) => {
            if (targetWorkspaceId === workspaceId) {
              if (targetFieldBundleId !== fieldBundleId) {
                message.info('Switching to target field set...');
                setFieldBundleId(targetFieldBundleId);
              }
              refetchFieldBundles(workspaceId);
              refetchFields(targetFieldBundleId);
              history.replace({
                pathname: `/workspace/${workspaceId}/extractions/data`,
                state: {
                  // Set field id so if `refreshDataGrid` has a different value
                  // this is required coz if consecutive clones are done
                  // the value of refreshDataGrid remains true and it doesn't refresh grid
                  refreshDataGrid: clonedFieldId,
                },
              });
            } else {
              if (isCloneAndRedirect) {
                message.info('Redirecting to target workspace...');
                history.push(
                  `/workspace/${targetWorkspaceId}/extractions/data`
                );
              }
            }
          }}
        />
      )}

      {showFieldContextModal && (
        <WorkspaceGridFieldContextModal
          fieldId={field?.id}
          fieldName={field?.name}
          hideModal={() => setShowFieldContextModal(false)}
        />
      )}
      {editStatsVisible && (
        <WorkspaceGridFieldBundleEditStatistics
          workspaceId={workspaceId}
          fieldBundleId={fieldBundleId}
          setEditStatsVisible={setEditStatsVisible}
        />
      )}
      {showVisualization && (
        <WorkspaceGridVisualizationModal
          viewOnly={viewOnly}
          hideModal={() => setShowVisualization(false)}
          filterModel={gridApi?.getFilterModel()}
          rowGroupCols={
            visualizeFieldId
              ? [
                  {
                    id: visualizeFieldId,
                    field: visualizeFieldId,
                    type: chartType === chartTypes.NUMERIC && dataTypes.NUMBER,
                  },
                ]
              : columnApi
                  ?.getRowGroupColumns()
                  ?.map(({ colId }) => ({ id: colId, field: colId }))
          }
          valueCols={columnApi
            ?.getValueColumns()
            ?.map(({ colId, aggFunc, colDef: { fieldName } }) => ({
              aggFunc,
              displayName: fieldName,
              field: colId,
              id: colId,
            }))}
          fieldBundleId={fieldBundleId}
          fieldName={visualizeFieldName}
          workspaceId={workspaceId}
          userId={userInfo?.id}
          chartType={chartType}
        />
      )}
      {
        <FieldSetModal
          onClose={() => {
            setShowCreateFieldBundleModal(false);
            setShowDeleteFieldBundleModal(false);
          }}
          onCreateFieldBundle={async fieldBundleId => {
            history.push(`/workspace/${workspaceId}/extractions/data`);
            const fieldBundles = await fetchFieldBundles(workspaceId);
            setFieldBundles(fieldBundles);
            setFieldBundleId(fieldBundleId);
          }}
          onDeleteFieldBundle={async () => {
            const fieldBundles = await fetchFieldBundles(workspaceId);
            setFieldBundles(fieldBundles);
            fieldBundles[0]?.id && setFieldBundleId(fieldBundles[0]?.id);
            history.push(`/workspace/${workspaceId}/extractions/data`);
          }}
          createVisible={showCreateFieldBundleModal}
          deleteVisible={showDeleteFieldBundleModal}
          workspaceId={workspaceId}
          fieldBundleId={fieldBundleId}
          fieldBundleName={
            fieldBundles?.find(({ id }) => id === fieldBundleId)?.bundleName
          }
          // deleteFsId={deleteFsData.id}
          // deleteFsName={deleteFsData.bundleName}
        />
      }
    </Layout>
  );
}
