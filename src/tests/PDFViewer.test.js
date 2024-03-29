import { render, screen } from '@testing-library/react';

import { PDFViewer } from '../components/PDFViewer';
import { WorkspaceContext } from '../components/Workspace';

describe('PDFViewer', () => {
  it('renders', () => {
    const providerProps = {
      fieldSets: [],
      documents: [],
      savedBundleId: '',
      setIframe: () => {
        console.log('setIframe');
      },
    };
    render(
      <WorkspaceContext.Provider value={providerProps}>
        <PDFViewer />
      </WorkspaceContext.Provider>
    );
    expect(screen).toBeTruthy();
  });
});
