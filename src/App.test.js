import React from 'react';
import { render } from '@testing-library/react';
import axios from 'axios';
import App from './App';

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(() => Promise.resolve({ status: 200, data: {} })),
    post: jest.fn(() => Promise.resolve({ status: 200, data: {} })),
  },
}));

describe('App', () => {
  beforeEach(() => {
    axios.get.mockClear();
    axios.post.mockClear();
  });

  test('renders without crashing', () => {
    const { container } = render(<App />);
    expect(container.querySelector('#app')).not.toBeNull();
  });
});
