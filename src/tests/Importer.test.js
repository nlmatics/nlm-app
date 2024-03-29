import { render, screen } from '@testing-library/react';

import Importer from '../components/Importer';
import * as AuthUtils from '../utils/use-auth.js';
import { WorkspaceContext } from '../components/Workspace';

// mock user auth from utils
const mockUser = {};
jest.spyOn(AuthUtils, 'useAuth').mockImplementation(() => {
  return mockUser;
});

describe('Importer', () => {
  it('renders', () => {
    const providerProps = {
      workspaceSearchCriteria: {
        question: '',
      },
    };

    render(
      <WorkspaceContext.Provider value={providerProps}>
        <Importer />
      </WorkspaceContext.Provider>
    );
    expect(screen).toBeTruthy();
  });
});
