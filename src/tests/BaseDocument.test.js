import { render, screen } from '@testing-library/react';
// I can't for the life of me get it to import this library for some reason
// But I also can't find another way to mock the DOM's document
// import { JSDOM } from 'jsdom';

import BaseDocument from '../components/BaseDocument';
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

// mock event listener
// const dom = new JSDOM('');
// global.document = dom.document;

// props for Workspace Context
const providerProps = {
  documents: [],
  currentDocument: {
    pdfUrl: '',
  },
  docMetadata: {
    inferred_title: '',
  },
  fileBrowserSelectedKeys: [],
  setScrollIntoView: () => {
    console.log('setScrollIntoView');
  },
};

describe('BaseDocument', () => {
  it('renders', () => {
    render(
      <WorkspaceContext.Provider value={providerProps}>
        <BaseDocument />
      </WorkspaceContext.Provider>
    );
    expect(screen).toBeTruthy();
  });

  it('matches HTML snapshot', () => {
    render(
      <WorkspaceContext.Provider value={providerProps}>
        <BaseDocument />
      </WorkspaceContext.Provider>
    );
    expect(screen).toMatchSnapshot();
  });
});
