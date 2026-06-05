import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import ShareControls from './ShareControls';

const mockWriteText = jest.fn();

// jsdom does not implement clipboard; install a mock before any test runs
Object.defineProperty(global.navigator, 'clipboard', {
  value: { writeText: mockWriteText },
  configurable: true,
});

beforeEach(() => {
  mockWriteText.mockReset();
  mockWriteText.mockResolvedValue(undefined);
});

describe('ShareControls', () => {
  it('renders a Share button', () => {
    const { getByRole } = render(<ShareControls vehicleId="T29" />);
    expect(getByRole('button', { name: /share/i })).toBeTruthy();
  });

  it('copies a URL containing the vehicleId on click', async () => {
    const { getByRole } = render(<ShareControls vehicleId="T29" />);
    fireEvent.click(getByRole('button'));
    await waitFor(() => expect(mockWriteText).toHaveBeenCalledWith(
      expect.stringContaining('/garage/T29')
    ));
  });

  it('encodes shell, hit, and camera into the copied URL', async () => {
    const hit = { x: 1, y: 2, z: 3 };
    const camera = { px: 5, py: 3, pz: 7, tx: 0, ty: 0, tz: 0 };
    const { getByRole } = render(
      <ShareControls vehicleId="M48A5" shell="AP-122-265" hit={hit} camera={camera} />
    );
    fireEvent.click(getByRole('button'));
    await waitFor(() => expect(mockWriteText).toHaveBeenCalled());
    const written = mockWriteText.mock.calls[0][0];
    expect(written).toContain('shell=AP-122-265');
    expect(written).toContain('hit=');
    expect(written).toContain('cam=');
  });

  it('shows Copied! feedback after a successful click', async () => {
    const { getByRole, findByText } = render(<ShareControls vehicleId="T29" />);
    fireEvent.click(getByRole('button'));
    expect(await findByText('Copied!')).toBeTruthy();
  });

  it('omits query params when no state is provided', async () => {
    const { getByRole } = render(<ShareControls vehicleId="T29" />);
    fireEvent.click(getByRole('button'));
    await waitFor(() => expect(mockWriteText).toHaveBeenCalled());
    const written = mockWriteText.mock.calls[0][0];
    expect(written).not.toContain('?');
  });
});
