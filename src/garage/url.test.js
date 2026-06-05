import { encodeGarageState, decodeGarageState } from './url';

describe('encodeGarageState', () => {
  it('builds a path with all params', () => {
    const result = encodeGarageState({
      vehicleId: 'T29',
      shell: 'AP-122-265',
      hit: { x: 1.5, y: -2.3, z: 0.8 },
      camera: { px: 5, py: 3, pz: 7, tx: 0, ty: 0, tz: 0 },
    });
    expect(result).toBe(
      '/garage/T29?shell=AP-122-265&hit=1.5%2C-2.3%2C0.8&cam=5%2C3%2C7%2C0%2C0%2C0'
    );
  });

  it('omits missing params from the query', () => {
    expect(encodeGarageState({ vehicleId: 'T29' })).toBe('/garage/T29');
    expect(encodeGarageState({ vehicleId: 'T29', shell: 'HEAT-152' })).toBe(
      '/garage/T29?shell=HEAT-152'
    );
  });

  it('URL-encodes the vehicleId', () => {
    const result = encodeGarageState({ vehicleId: 'tank name' });
    expect(result).toContain('/garage/tank%20name');
  });
});

describe('decodeGarageState', () => {
  it('decodes a full query string', () => {
    const result = decodeGarageState(
      '?shell=AP-122-265&hit=1.5,-2.3,0.8&cam=5,3,7,0,0,0'
    );
    expect(result.shell).toBe('AP-122-265');
    expect(result.hit).toEqual({ x: 1.5, y: -2.3, z: 0.8 });
    expect(result.camera).toEqual({ px: 5, py: 3, pz: 7, tx: 0, ty: 0, tz: 0 });
  });

  it('returns nulls for missing params', () => {
    const result = decodeGarageState('');
    expect(result).toEqual({ shell: null, hit: null, camera: null });
  });

  it('returns null hit when the value is malformed', () => {
    const { hit } = decodeGarageState('?hit=notanumber,1,2');
    expect(hit).toBeNull();
  });

  it('returns null camera when not enough components', () => {
    const { camera } = decodeGarageState('?cam=1,2,3');
    expect(camera).toBeNull();
  });

  it('round-trips encode → decode', () => {
    const state = {
      vehicleId: 'M48A5',
      shell: 'APCR-100-250',
      hit: { x: 0, y: 1.1, z: -0.5 },
      camera: { px: 3, py: 2, pz: 5, tx: 0, ty: 0.5, tz: 0 },
    };
    const path = encodeGarageState(state);
    const search = path.includes('?') ? path.slice(path.indexOf('?')) : '';
    const decoded = decodeGarageState(search);
    expect(decoded.shell).toBe(state.shell);
    expect(decoded.hit.x).toBeCloseTo(state.hit.x);
    expect(decoded.hit.y).toBeCloseTo(state.hit.y);
    expect(decoded.hit.z).toBeCloseTo(state.hit.z);
    expect(decoded.camera).toMatchObject({
      px: state.camera.px,
      py: state.camera.py,
      pz: state.camera.pz,
    });
  });
});
