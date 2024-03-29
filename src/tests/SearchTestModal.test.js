import { render, screen } from '@testing-library/react';

import SearchTestModal from '../components/SearchTestModal';
import * as AuthUtils from '../utils/use-auth.js';
import { WorkspaceContext } from '../components/Workspace';

// mock user auth from utils
const mockUser = {};
jest.spyOn(AuthUtils, 'useAuth').mockImplementation(() => {
  return mockUser;
});

describe('SearchTestModal', () => {
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
        <SearchTestModal />
      </WorkspaceContext.Provider>
    );
    expect(screen).toBeTruthy();
  });
});
