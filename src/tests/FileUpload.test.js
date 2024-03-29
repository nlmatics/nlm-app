import { render, screen } from '@testing-library/react';

import FileUpload from '../components/FileUpload';
import * as AuthUtils from '../utils/use-auth.js';

// mock user auth from utils
const mockUser = {};
jest.spyOn(AuthUtils, 'useAuth').mockImplementation(() => {
  return mockUser;
});

describe('FileUpload', () => {
  it('renders', () => {
    render(<FileUpload />);
    expect(screen).toBeTruthy();
  });

  it('matches HTML snapshot', () => {
    render(<FileUpload />);
    expect(screen).toMatchSnapshot();
  });
});
