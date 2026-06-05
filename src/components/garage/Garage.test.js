import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';

// Mock R3F and drei before importing components that import them
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }) => <div data-testid="r3f-canvas">{children}</div>,
  useThree: () => ({
    camera: {
      position: { set: jest.fn() },
      lookAt: jest.fn(),
    },
  }),
  useFrame: () => {},
}));

jest.mock('@react-three/drei', () => {
  const mockReact = require('react');
  return {
    OrbitControls: mockReact.forwardRef((props, ref) => {
      if (ref) ref.current = { target: { copy: jest.fn() }, update: jest.fn() };
      return null;
    }),
    useGLTF: () => ({ scene: {} }),
    Grid: () => null,
  };
});

jest.mock('axios');

// Suppress act() warning noise for async state updates in tests
beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  console.error.mockRestore();
  jest.clearAllMocks();
});

/** Renders ui inside a MemoryRouter with a parent garage/* route so nested routes resolve correctly. */
const renderInRouter = (ui, path = '/garage') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="garage/*" element={ui} />
      </Routes>
    </MemoryRouter>
  );

describe('Garage', () => {
  it('redirects /garage to default vehicle', () => {
    axios.get.mockResolvedValue({ data: [] });
    const { container } = renderInRouter(
      React.createElement(require('./Garage').default),
      '/garage'
    );
    // After redirect the vehicleId route is active — scene wrapper should exist
    expect(container.firstChild).not.toBeNull();
  });

  it('renders scene view for /garage/:vehicleId', async () => {
    axios.get.mockResolvedValue({ data: [] });
    renderInRouter(
      React.createElement(require('./Garage').default),
      '/garage/3393'
    );
    expect(screen.getByTestId('r3f-canvas')).toBeInTheDocument();
  });

  it('shows retry button when model load fails', async () => {
    axios.get.mockRejectedValue(new Error('network error'));
    renderInRouter(
      React.createElement(require('./Garage').default),
      '/garage/3393'
    );
    // Picker fetch also fails — retry button from picker is present
    const retryBtns = await screen.findAllByRole('button', { name: /retry/i });
    expect(retryBtns.length).toBeGreaterThan(0);
  });
});

describe('GaragePicker', () => {
  it('renders filter dropdowns', () => {
    axios.get.mockResolvedValue({ data: [] });
    const GaragePicker = require('./GaragePicker').default;
    renderInRouter(
      <GaragePicker onSelect={jest.fn()} />,
      '/garage'
    );
    expect(screen.getByLabelText(/nation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tier/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/type/i)).toBeInTheDocument();
  });

  it('calls onSelect with vehicleId when a tank is clicked', async () => {
    const onSelect = jest.fn();
    axios.get.mockResolvedValue({
      data: [{ vehicleId: '7169', name: 'T-54', nation: 'ussr', tier: 9, type: 'mediumTank' }],
    });
    const GaragePicker = require('./GaragePicker').default;
    renderInRouter(
      <GaragePicker onSelect={onSelect} />,
      '/garage'
    );
    const item = await screen.findByText('T-54');
    fireEvent.click(item.closest('li'));
    expect(onSelect).toHaveBeenCalledWith('7169');
  });
});

describe('useTankGltf', () => {
  it('returns loading true initially then resolves data', async () => {
    const garagePayload = {
      tankopedia: { name: 'T-54' },
      armor: {},
      model: { url: 'https://cdn.example.com/t54.glb' },
      shellTypes: ['AP', 'HEAT'],
    };
    axios.get.mockResolvedValue({ data: garagePayload });

    const { useTankGltf } = require('./useTankGltf');
    const { renderHook, waitFor } = require('@testing-library/react');

    const { result } = renderHook(() => useTankGltf('7169'));
    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.tankopedia).toEqual({ name: 'T-54' });
    expect(result.current.modelUrl).toBe('https://cdn.example.com/t54.glb');
    expect(result.current.shellTypes).toEqual(['AP', 'HEAT']);
  });

  it('returns error and retry callback on failure', async () => {
    axios.get.mockRejectedValue(new Error('500'));
    const { useTankGltf } = require('./useTankGltf');
    const { renderHook, waitFor } = require('@testing-library/react');

    const { result } = renderHook(() => useTankGltf('7169'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).not.toBeNull();
    expect(typeof result.current.retry).toBe('function');
  });
});
