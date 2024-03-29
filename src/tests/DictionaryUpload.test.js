import { render, screen } from '@testing-library/react';
import DictionaryUpload from '../components/DictionaryUpload';

describe('DictionaryUpload', () => {
  it('renders', () => {
    render(<DictionaryUpload />);
    expect(screen).toBeTruthy();
  });
});
