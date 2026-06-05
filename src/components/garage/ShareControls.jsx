import React, { useState, useCallback } from 'react';
import { encodeGarageState } from '../../garage/url';

/**
 * Standalone "Share" button for the garage HUD.
 *
 * Drop this anywhere in the garage UI and pass the current garage state as props.
 * On click it encodes state into the URL and writes it to the clipboard.
 *
 * Integration contract for garage-interaction:
 *   <ShareControls vehicleId={vehicleId} shell={shell} hit={hit} camera={camera} />
 *
 * Integration contract for garage-scene (Garage.jsx mount):
 *   import { decodeGarageState } from '../../garage/url';
 *   const { shell, hit, camera } = decodeGarageState(window.location.search);
 *   // restore camera, apply shell, run penetrate(hit) if values are non-null
 *
 * @param {{ vehicleId: string, shell?: string|null, hit?: {x,y,z}|null, camera?: {px,py,pz,tx,ty,tz}|null }} props
 */
export default function ShareControls({ vehicleId, shell = null, hit = null, camera = null }) {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(() => {
    const path = encodeGarageState({ vehicleId, shell, hit, camera });
    const url = `${window.location.origin}${path}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [vehicleId, shell, hit, camera]);

  return (
    <button onClick={handleShare} aria-label="Copy shareable link">
      {copied ? 'Copied!' : 'Share'}
    </button>
  );
}
