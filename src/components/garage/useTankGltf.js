import { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * Fetches the garage fan-out payload for a vehicle from the edge service.
 * Contract shape: { tankopedia, armor, model: { url }, shellTypes }
 * Expose this surface so garage-interaction can consume tankopedia/armor/shellTypes
 * without re-fetching.
 */
export function useTankGltf(vehicleId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!vehicleId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    axios
      .get(`/api/vehicles/${vehicleId}/garage`)
      .then(res => {
        if (!cancelled) {
          setData(res.data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [vehicleId, attempt]);

  return {
    tankopedia: data?.tankopedia ?? null,
    armor: data?.armor ?? null,
    modelUrl: data?.model?.url ?? null,
    shellTypes: data?.shellTypes ?? [],
    loading,
    error,
    retry: () => setAttempt(a => a + 1),
  };
}
