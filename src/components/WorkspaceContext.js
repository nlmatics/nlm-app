import React, { Component } from 'react';
import { roles } from '../utils/constants';
import {
  viewTypes,
  searchCriteriaDefaults,
  displayFormats,
} from '../utils/constants.js';

//exporting context object
export const WorkspaceContext = React.createContext({});

const workspaceSearchCriteria = {
  patterns: undefined,
  question: undefined,
  fieldName: undefined,
  sectionHeading: undefined,
  criterias: [
    {
      question: '',
      templates: [],
      headers: [],
      expectedAnswerType: 'auto',
      groupFlag: 'disable',
      tableFlag: 'disable',
      pageStart: -1,
      pageEnd: -1,
      beforeContextWindow: 0,
      afterContextWindow: 0,
      criteriaRank: 1,
      entityTypes: [],
      additionalQuestions: [],
    },
  ],
};

const searchResults = {
  grid: [[], []],
  tmpFileFacts: [],
  totalCount: 0,
  preProcessors: {},
  fileFacts: [],
  empty: false,
};
class Workspace extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: true,
      toggleSider: this.toggleSider,
      currentDocument: {
        id: '',
        html: { title: '' },
        name: '',
        pdfUrl: null,
        json: '',
        xml: undefined,
      },
      setCurrentDocument: this.setCurrentDocument,
      docSearchCriteria: {
        patterns: undefined,
        question: undefined,
        fieldName: undefined,
        sectionHeading: undefined,
        criterias: [
          {
            question: '',
            templates: [],
            headers: [],
            expectedAnswerType: 'auto',
            groupFlag: 'disable',
            tableFlag: 'disable',
            pageStart: -1,
            pageEnd: -1,
            criteriaRank: -1,
          },
        ],
      },
      setDocSearchCriteria: this.setDocSearchCriteria,
      workspaceSearchCriteria,
      setWorkspaceSearchCriteria: this.setWorkspaceSearchCriteria,
      resetWorkspaceSearchCriteria: this.resetWorkspaceSearchCriteria,
      prevWorkspaceSearchCriteria: {
        patterns: undefined,
        question: undefined,
        fieldName: undefined,
        sectionHeading: undefined,
      },
      setPrevWorkspaceSearchCriteria: this.setPrevWorkspaceSearchCriteria,
      relationSearchCriteria: {
        patterns: undefined,
        question: undefined,
        fieldName: undefined,
        sectionHeading: undefined,
        criterias: [
          {
            question: '',
            templates: [],
            headers: [],
            additionalQuestions: [],
            expectedAnswerType: 'auto',
            groupFlag: 'disable',
            tableFlag: 'disable',
            pageStart: -1,
            pageEnd: -1,
            criteriaRank: -1,
          },
        ],
      },
      setRelationSearchCriteria: this.setRelationSearchCriteria,
      loadingBasedocument: false,
      scrollIntoView: null,
      setScrollIntoView: this.setScrollIntoView,
      selectedBundleName: '',
      setSelectedBundleName: this.setSelectedBundleName,
      setRenderedBundleKey: this.setRenderedBundleKey,
      renderedBundleKey: '',
      setSavedFieldId: this.setSavedFieldId,
      savedFieldId: '',
      setCurrentWorkspaceFields: this.setCurrentWorkspaceFields,
      currentWorkspaceFields: '',
      setSavedBundleId: this.setSavedBundleId,
      savedBundleId: '',
      routes: [
        {
          path: 'index',
          breadcrumbName: 'First-level Menu',
        },
        {
          path: 'first',
          breadcrumbName: 'Second-level Menu',
        },
        {
          path: 'second',
          breadcrumbName: 'Third-level Menu',
        },
      ],
      setRoutes: this.setRoutes,
      searchResults,
      setSearchResults: this.setSearchResults,
      resetSearchResults: this.resetSearchResults,
      docSearchResults: { empty: false, results: [] },
      setDocSearchResults: this.setDocSearchResults,
      relationSearchResults: {
        totalCount: 0,
        fileFacts: [],
        empty: false,
      },
      setRelationSearchResults: this.setRelationSearchResults,

      workspaceSearchVisible: true,
      setWorkspaceSearchVisible: this.setWorkspaceSearchVisible,
      searchResultsVisible: false,
      setSearchResultsVisible: this.setSearchResultsVisible,
      searchLoading: false,
      setUpdateFieldSelectorEdit: this.setUpdateFieldSelectorEdit,
      updateFieldSelctorEdit: false,
      setSearchLoading: this.setSearchLoading,
      workspaceSearchLoading: false,
      setWorkspaceSearchLoading: this.setWorkspaceSearchLoading,
      baseDocumentWidth: '',
      setBaseDocumentWidth: this.setBaseDocumentWidth,
      setLoadingBasedocument: this.setLoadingBasedocument,
      backTopRight: 33,
      setBackTopRight: this.setBackTopRight,
      currentWorkspaceId: null,
      setCurrentWorkspaceId: this.setCurrentWorkspaceId,
      currentWorkspaceName: '',
      setCurrentWorkspaceName: this.setCurrentWorkspaceName,
      currentWorkspace: null,
      setCurrentWorkspace: this.setCurrentWorkspace,
      currentWorkspaceEditable: false,
      setCurrentWorkspaceEditable: this.setCurrentWorkspaceEditable,
      workspaceGridVisible: false,
      setWorkspaceGridVisible: this.setWorkspaceGridVisible,
      selectedText: '',
      setSelectedText: this.setSelectedText,
      workspaces: [],
      setWorkspaces: this.setWorkspaces,
      fieldSets: [],
      setFieldSets: this.setFieldSets,
      extractionGridVisible: false,
      setExtractionGridVisible: this.setExtractionGridVisible,
      fileBrowserSelectedKeys: [],
      setFileBrowserSelectedKeys: this.setFileBrowserSelectedKeys,
      extractGridData: [[], []],
      iframe: null,
      setIframe: this.setIframe,
      searchPDF: null,
      setWorkspaceSearchHistoryTriggered:
        this.setWorkspaceSearchHistoryTriggered,
      workspaceSearchHistoryTriggered: false,
      setWorkspaceSearchHistoryParams: this.setWorkspaceSearchHistoryParams,
      workspaceSearchHistoryParams: {
        question: '',
        sectionHeading: '',
        postProcessors: '',
        patterns: '',
      },
      setSearchPDF: this.setSearchPDF,
      displayFormat: displayFormats.PDF,
      setDisplayFormat: this.setDisplayFormat,
      documents: [],
      setDocuments: this.setDocuments,
      totalDocCount: 0,
      setTotalDocCount: this.setTotalDocCount,
      recentDocuments: [],
      setRecentDocuments: this.setRecentDocuments,
      workspaceSearchMode: true,
      setWorkspaceSearchMode: this.setWorkspaceSearchMode,
      pickedResult: null,
      setPickedResult: this.setPickedResult,
      refreshGrid: false,
      setRefreshGrid: this.setRefreshGrid,
      viewType: viewTypes.GRID,
      setViewType: this.setViewType,
      selectedGraphNode: [],
      setSelectedGraphNode: this.setSelectedGraphNode,
      docViewTabIndex: '1',
      record: null,
      setRecord: this.setRecord,
      workspaceEditedFieldId: null,
      setWorkspaceEditedFieldId: this.setWorkspaceEditedFieldId,
      setSearchTestMode: this.setSearchTestMode,
      searchTestMode: false,
      setUpdateWsGrid: this.setUpdateWsGrid,
      updateWsGrid: false,
      setUrlParams: this.setUrlParams,
      urlParams: [],
      setRouterState: this.setRouterState,
      loadingDocuments: false,
      setLoadingDocuments: this.setLoadingDocuments,
      searchCriteriaDocPerPage: searchCriteriaDefaults.DOC_PER_PAGE,
      setSearchCriteriaDocPerPage: this.setSearchCriteriaDocPerPage,
      docListDocPerPage: 25,
      setDocListDocPerPage: this.setDocListDocPerPage,
      docExtractGridData: [],
      setDocExtractGridData: this.setDocExtractGridData,
      saveFieldVisible: false,
      setSaveFieldVisible: this.setSaveFieldVisible,
      fieldEditMode: false,
      setFieldEditMode: this.setFieldEditMode,
      fieldEditData: null,
      setFieldEditData: this.setFieldEditData,
      fieldValueEditData: null,
      setFieldValueEditData: this.setFieldValueEditData,
      workspaceSearchSelectedResult: null,
      setWorkspaceSearchSelectedResult: this.setWorkspaceSearchSelectedResult,
      fieldUpdateInProgress: false,
      setFieldUpdateInProgress: this.setFieldUpdateInProgress,
      fieldsInfo: [],
      setFieldsInfo: this.setFieldsInfo,
      currentUserRole: roles.VIEWER,
      setCurrentUserRole: this.setCurrentUserRole,
      sortedWorkspaces: {},
      setSortedWorkspaces: this.setSortedWorkspaces,
      documentsDropdown: [],
      setDocumentsDropdown: this.setDocumentsDropdown,
      keyInfoLoading: false,
      setKeyInfoLoading: this.setKeyInfoLoading,
      prevOpenedWorkspaceId: 'all',
      setPrevOpenedWorkspaceId: this.setPrevOpenedWorkspaceId,
    };
  }
  setRoutes = routes => {
    this.setState({ routes });
  };
  setKeyInfoLoading = keyInfoLoading => {
    this.setState({ keyInfoLoading });
  };
  setFieldsInfo = fieldsInfo => {
    this.setState({ fieldsInfo });
  };
  setFieldUpdateInProgress = fieldUpdateInProgress => {
    this.setState({ fieldUpdateInProgress });
  };
  setWorkspaceSearchSelectedResult = workspaceSearchSelectedResult => {
    this.setState({ workspaceSearchSelectedResult });
  };
  setFieldValueEditData = fieldValueEditData => {
    this.setState({ fieldValueEditData });
  };

  setFieldEditData = fieldEditData => {
    this.setState({ fieldEditData });
  };

  setFieldEditMode = fieldEditMode => {
    this.setState({ fieldEditMode });
  };

  setSaveFieldVisible = saveFieldVisible => {
    this.setState({ saveFieldVisible });
  };

  setDocExtractGridData = docExtractGridData => {
    this.setState({ docExtractGridData });
  };

  setSearchCriteriaDocPerPage = searchCriteriaDocPerPage => {
    this.setState({ searchCriteriaDocPerPage });
  };
  setDocListDocPerPage = docListDocPerPage => {
    this.setState({ docListDocPerPage });
  };
  setLoadingDocuments = loadingDocuments => {
    this.setState({ loadingDocuments });
  };
  setUrlParams = urlParams => {
    this.setState({ urlParams });
  };
  setWorkspaceEditedFieldId = workspaceEditedFieldId => {
    this.setState({ workspaceEditedFieldId });
  };
  setRecord = record => {
    this.setState({ record });
  };
  setCurrentWorkspaceEditable = currentWorkspaceEditable => {
    this.setState({ currentWorkspaceEditable });
  };
  setViewType = viewType => {
    this.setState({ viewType });
  };
  setSelectedGraphNode = selectedGraphNode => {
    this.setState({ selectedGraphNode });
  };
  setRefreshGrid = refreshGrid => {
    this.setState({ refreshGrid });
  };

  setFieldNameToEdit = fieldNameToEdit => {
    this.setState({ fieldNameToEdit });
  };

  setPickedResult = pickedResult => {
    this.setState({ pickedResult });
  };

  setAnswerEditMode = answerEditMode => {
    this.setState({ answerEditMode });
  };

  setPrevWorkspaceSearchCriteria = prevWorkspaceSearchCriteria => {
    this.setState({ prevWorkspaceSearchCriteria });
  };

  setWorkspaceSearchCriteria = workspaceSearchCriteria => {
    this.setState({ workspaceSearchCriteria });
  };

  resetWorkspaceSearchCriteria = () => {
    this.setState({ workspaceSearchCriteria });
  };

  setDocSearchCriteria = docSearchCriteria => {
    this.setState({ docSearchCriteria });
  };

  setRelationSearchCriteria = relationSearchCriteria => {
    this.setState({ relationSearchCriteria });
  };

  setCurrentDocument = currentDocument => {
    this.setState({ currentDocument });
  };

  setSearchTestMode = searchTestMode => {
    this.setState({ searchTestMode });
  };

  setUpdateWsGrid = updateWsGrid => {
    this.setState({ updateWsGrid });
  };

  setSelectedBundleName = selectedBundleName => {
    this.setState({ selectedBundleName });
  };

  setRenderedBundleKey = renderedBundleKey => {
    this.setState({ renderedBundleKey });
  };

  setCurrentWorkspaceFields = currentWorkspaceFields => {
    this.setState({ currentWorkspaceFields });
  };

  setSavedBundleId = savedBundleId => {
    this.setState({ savedBundleId });
  };

  setSavedFieldId = savedFieldId => {
    this.setState({ savedFieldId });
  };

  setWorkspaceSearchMode = workspaceSearchMode => {
    this.setState({ workspaceSearchMode });
  };

  setDocuments = documents => {
    this.setState({ documents });
  };

  setTotalDocCount = totalDocCount => {
    this.setState({ totalDocCount });
  };

  setRecentDocuments = recentDocuments => {
    this.setState({ recentDocuments });
  };

  setDisplayFormat = displayFormat => {
    this.setState({ displayFormat });
  };

  setSearchPDF = searchPDF => {
    this.setState({ searchPDF });
  };

  setIframe = iframe => {
    this.setState({ iframe });
  };

  setSearchResults = searchResults => {
    this.setState({ searchResults });
  };
  resetSearchResults = () => {
    this.setState({ searchResults });
  };

  setDocSearchResults = docSearchResults => {
    this.setState({ docSearchResults });
  };

  setRelationSearchResults = relationSearchResults => {
    this.setState({ relationSearchResults });
  };

  setUpdateFieldSelectorEdit = updateFieldSelctorEdit => {
    this.setState({ updateFieldSelctorEdit });
  };

  setFileBrowserSelectedKeys = fileBrowserSelectedKeys => {
    this.setState({ fileBrowserSelectedKeys });
  };

  setExtractionGridVisible = extractionGridVisible => {
    this.setState({ extractionGridVisible });
  };

  setFieldSets = fieldSets => {
    this.setState({ fieldSets });
  };

  setWorkspaces = workspaces => {
    this.setState({ workspaces });
  };

  setWorkspaceSearchLoading = workspaceSearchLoading => {
    this.setState({ workspaceSearchLoading });
  };
  setSelectedText = selectedText => {
    this.setState({ selectedText });
  };
  setWorkspaceGridVisible = workspaceGridVisible => {
    this.setState({ workspaceGridVisible });
  };

  setCurrentWorkspaceName = currentWorkspaceName => {
    this.setState({ currentWorkspaceName });
  };

  setWorkspaceSearchVisible = workspaceSearchVisible => {
    this.setState({ workspaceSearchVisible });
  };

  setWorkspaceSearchHistoryTriggered = workspaceSearchHistoryTriggered => {
    this.setState({ workspaceSearchHistoryTriggered });
  };

  setWorkspaceSearchHistoryParams = workspaceSearchHistoryParams => {
    this.setState({ workspaceSearchHistoryParams });
  };

  setBackTopRight = backTopRight => {
    this.setState({ backTopRight });
  };

  setSearchLoading = searchLoading => {
    this.setState({ searchLoading });
  };

  setFileUploading = fileUploading => {
    this.setState({ fileUploading });
  };

  setSearchResultsVisible = searchResultsVisible => {
    this.setState({ searchResultsVisible });
  };

  setLoadingBasedocument = loadingBasedocument => {
    this.setState({ loadingBasedocument });
  };

  setBaseDocumentWidth = baseDocumentWidth => {
    this.setState({ baseDocumentWidth });
  };

  setCurrentWorkspaceId = currentWorkspaceId => {
    this.setState({
      currentWorkspaceId,
    });
  };

  setRouterState = () => {
    console.log('setRouterState called, which does nothing right now');
  };

  setCurrentWorkspace = currentWorkspace => {
    this.setState({
      currentWorkspace,
    });
  };

  setScrollIntoView = scrollIntoView => {
    this.setState({
      scrollIntoView,
    });
  };

  toggleSider = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  };

  setCurrentUserRole = currentUserRole => {
    this.setState({ currentUserRole });
  };

  setSortedWorkspaces = sortedWorkspaces => {
    this.setState({ sortedWorkspaces });
  };

  setDocumentsDropdown = documentsDropdown => {
    this.setState({ documentsDropdown });
  };

  setPrevOpenedWorkspaceId = prevOpenedWorkspaceId => {
    this.setState({ prevOpenedWorkspaceId });
  };

  render() {
    return (
      <WorkspaceContext.Provider value={this.state}>
        {this.props.children}
      </WorkspaceContext.Provider>
    );
  }
}

export default Workspace;
