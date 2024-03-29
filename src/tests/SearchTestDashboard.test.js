import { render, screen } from '@testing-library/react';

import SearchTestDashboard from '../components/SearchTestDashboard';
import * as AuthUtils from '../utils/use-auth.js';
import { WorkspaceContext } from '../components/Workspace';
import * as ApiCalls from '../utils/apiCalls';

// mock user auth from utils
const mockUser = {};
jest.spyOn(AuthUtils, 'useAuth').mockImplementation(() => {
  return mockUser;
});

// mock getSearchTests from apiCalls
const mockTests = {};
jest.spyOn(ApiCalls, 'getSearchTests').mockImplementation(() => {
  return mockTests;
});

describe('SearchTestDashboard', () => {
  it('renders', () => {
    const providerProps = {
      currentDocument: {
        id: '',
      },
      documents: [],
      workspaces: [],
    };

    render(
      <WorkspaceContext.Provider value={providerProps}>
        <SearchTestDashboard />
      </WorkspaceContext.Provider>
    );
    expect(screen).toBeTruthy();
  });
});
