import { render, screen } from '@testing-library/react';

import FileDrop from '../components/FileDrop';

describe('FileDrop', () => {
  it('renders', () => {
    render(<FileDrop />);
    expect(screen).toBeTruthy();
  });

  it('matches HTML snapshot', () => {
    render(<FileDrop />);
    expect(screen).toMatchSnapshot();
  });
});
