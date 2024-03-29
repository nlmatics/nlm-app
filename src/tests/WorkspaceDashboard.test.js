import { render, screen } from '@testing-library/react';

import WorkspaceDashboard from '../components/WorkspaceDashboard';
import * as AuthUtils from '../utils/use-auth.js';
import { WorkspaceContext } from '../components/Workspace';

// mock user auth from utils
const mockUser = {};
jest.spyOn(AuthUtils, 'useAuth').mockImplementation(() => {
  return mockUser;
});

// Props for the Workspace Context
const providerProps = {
  documents: [],
  ingestionStatuses: [],
  fileBrowserSelectedKeys: [],
};

describe('WorkspaceDashboard', () => {
  it('renders', () => {
    render(
      <WorkspaceContext.Provider value={providerProps}>
        <WorkspaceDashboard />
      </WorkspaceContext.Provider>
    );
    expect(screen).toBeTruthy();
  });

  it('matches HTML snapshot', () => {
    render(
      <WorkspaceContext.Provider value={providerProps}>
        <WorkspaceDashboard />
      </WorkspaceContext.Provider>
    );
    expect(screen).toMatchSnapshot();
  });
});
