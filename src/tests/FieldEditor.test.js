import { render, screen } from '@testing-library/react';

import FieldEditor from '../components/FieldEditor';
import { WorkspaceContext } from '../components/Workspace';

// mock window.matchMedia
global.matchMedia =
  global.matchMedia ||
  function () {
    return {
      addListener: jest.fn(),
      removeListener: jest.fn(),
    };
  };

// props for Workspace Context
const providerProps = {
  fieldSets: [],
};

describe('FieldEditor', () => {
  it('renders', () => {
    render(
      <WorkspaceContext.Provider value={providerProps}>
        <FieldEditor />
      </WorkspaceContext.Provider>
    );
    expect(screen).toBeTruthy();
  });

  it('matches HTML snapshot', () => {
    render(
      <WorkspaceContext.Provider value={providerProps}>
        <FieldEditor />
      </WorkspaceContext.Provider>
    );
    expect(screen).toMatchSnapshot();
  });
});
