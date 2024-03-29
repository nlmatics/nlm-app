import { render, screen } from '@testing-library/react';

import DetailSider from '../components/DetailSider';
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

// props for the Workspace Context
const providerProps = {
  currentDocument: {
    id: '',
  },
};

describe('DetailSider', () => {
  it('renders', () => {
    render(
      <WorkspaceContext.Provider value={providerProps}>
        <DetailSider editedField={{}} />
      </WorkspaceContext.Provider>
    );
    expect(screen).toBeTruthy();
  });

  it('matches HTML snapshot', () => {
    render(
      <WorkspaceContext.Provider value={providerProps}>
        <DetailSider editedField={{}} />
      </WorkspaceContext.Provider>
    );
    expect(screen).toMatchSnapshot();
  });
});
