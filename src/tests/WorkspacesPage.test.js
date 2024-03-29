import { render, screen } from '@testing-library/react';

import WorkspacesPage from '../components/WorkspacesPage';
import * as AuthUtils from '../utils/use-auth.js';
import { WorkspaceContext } from '../components/Workspace';

// mock user auth from utils
const mockUser = {};
jest.spyOn(AuthUtils, 'useAuth').mockImplementation(() => {
  return mockUser;
});

// mock window.matchMedia
global.matchMedia =
  global.matchMedia ||
  function () {
    return {
      addListener: jest.fn(),
      removeListener: jest.fn(),
    };
  };

// providerProps
const providerProps = {
  sortedWorkspaces: {
    private_workspaces: [],
    collaborated_workspaces: [],
    subscribed_workspaces: [],
    public_workspaces: [],
  },
};

describe('WorkspacesPage', () => {
  it('renders', () => {
    render(
      <WorkspaceContext.Provider value={providerProps}>
        <WorkspacesPage />
      </WorkspaceContext.Provider>
    );
    expect(screen).toBeTruthy();
  });

  it('matches HTML snapshot', () => {
    render(
      <WorkspaceContext.Provider value={providerProps}>
        <WorkspacesPage />
      </WorkspaceContext.Provider>
    );
    expect(screen).toMatchSnapshot();
  });
});
