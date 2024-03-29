import { render, screen } from '@testing-library/react';

import WorkspaceSearch from '../components/WorkspaceSearch';
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

describe('WorkspaceSearch', () => {
  it('renders', () => {
    const providerProps = {
      searchResults: {
        fileFacts: [],
      },
      prevWorkspaceSearchCriteria: {
        question: '',
      },
      workspaceSearchCriteria: {
        question: '',
      },
    };

    render(
      <WorkspaceContext.Provider value={providerProps}>
        <WorkspaceSearch />
      </WorkspaceContext.Provider>
    );
    expect(screen).toBeTruthy();
  });
});
