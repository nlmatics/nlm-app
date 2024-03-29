export const defaultProviderProps = {
  currentDocument: {
    name: '',
  },
  currentWorkspaceId: '',
  documents: [],
  fieldSets: [],
  fileBrowserSelectedKeys: [],
  setExtractionGridVisible: () => {
    console.log('setExtractionGridVisible');
  },
  setFileBrowserSelectedKeys: () => {
    console.log('setFileBrowserSelectedKeys');
  },
  setWorkspaceSearchVisible: () => {
    console.log('setWorkspaceSearchVisible');
  },
  setWorkspaceSearchMode: () => {
    console.log('setWorkspaceSearchMode');
  },
  workspaces: [],
  workspaceSearchCriteria: {
    question: '',
  },
  workspaceSearchVisible: true,
};
