/**
 * Encode garage state into a shareable URL path + query string.
 * Returns a relative path like /garage/T29?shell=AP-122-265&hit=1,2,3&cam=5,3,7,0,0,0
 *
 * @param {object} opts
 * @param {string} opts.vehicleId
 * @param {string|null}  [opts.shell]  - e.g. "AP-122-265"
 * @param {{x:number,y:number,z:number}|null} [opts.hit]
 * @param {{px:number,py:number,pz:number,tx:number,ty:number,tz:number}|null} [opts.camera]
 * @returns {string}
 */
export function encodeGarageState({ vehicleId, shell = null, hit = null, camera = null }) {
  const params = new URLSearchParams();
  if (shell) params.set('shell', shell);
  if (hit) params.set('hit', `${hit.x},${hit.y},${hit.z}`);
  if (camera) {
    params.set('cam', `${camera.px},${camera.py},${camera.pz},${camera.tx},${camera.ty},${camera.tz}`);
  }
  const query = params.toString();
  const path = `/garage/${encodeURIComponent(vehicleId)}`;
  return query ? `${path}?${query}` : path;
}

/**
 * Decode garage state from a URL search string (window.location.search).
 * Unknown or malformed values resolve to null so callers fall back to defaults.
 *
 * @param {string} search - e.g. "?shell=AP-122-265&hit=1,2,3&cam=5,3,7,0,0,0"
 * @returns {{ shell: string|null, hit: {x,y,z}|null, camera: {px,py,pz,tx,ty,tz}|null }}
 */
export function decodeGarageState(search) {
  const params = new URLSearchParams(search);

  const shell = params.get('shell') || null;

  let hit = null;
  const hitRaw = params.get('hit');
  if (hitRaw) {
    const parts = hitRaw.split(',').map(Number);
    const [x, y, z] = parts;
    if (parts.length === 3 && parts.every(n => !isNaN(n))) {
      hit = { x, y, z };
    }
  }

  let camera = null;
  const camRaw = params.get('cam');
  if (camRaw) {
    const parts = camRaw.split(',').map(Number);
    const [px, py, pz, tx, ty, tz] = parts;
    if (parts.length === 6 && parts.every(n => !isNaN(n))) {
      camera = { px, py, pz, tx, ty, tz };
    }
  }

  return { shell, hit, camera };
}
