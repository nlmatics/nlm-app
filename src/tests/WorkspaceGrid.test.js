import { render, screen } from '@testing-library/react';

import { WorkspaceGrid } from '../components/WorkspaceGrid';
import { WorkspaceContext } from '../components/Workspace';
import * as AuthUtils from '../utils/use-auth.js';

// mock user auth from utils
const mockUser = {};
jest.spyOn(AuthUtils, 'useAuth').mockImplementation(() => {
  return mockUser;
});

// Props for the Workspace Context
const providerProps = {
  fieldSets: [],
  documents: [],
  savedBundleId: '',
  fieldsInfo: {
    fieldBundleId: '',
  },
  currentWorkspace: {
    documents: [],
  },
  workspaces: [],
};

describe('WorkspaceGrid', () => {
  it('renders', () => {
    render(
      <WorkspaceContext.Provider value={providerProps}>
        <WorkspaceGrid gridData={[[], []]} />
      </WorkspaceContext.Provider>
    );
    expect(screen).toBeTruthy();
  });

  it('matches HTML snapshot', () => {
    render(
      <WorkspaceContext.Provider value={providerProps}>
        <WorkspaceGrid gridData={[[], []]} />
      </WorkspaceContext.Provider>
    );
    expect(screen).toMatchSnapshot();
  });
});
