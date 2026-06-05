import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const NATIONS = ['ussr', 'germany', 'usa', 'china', 'france', 'uk', 'japan', 'czech', 'sweden', 'italy', 'poland'];
const TYPES = ['heavyTank', 'mediumTank', 'lightTank', 'AT-SPG', 'SPG'];

/**
 * Filterable vehicle picker.
 * Fetches /api/vehicles and allows the user to filter by nation/tier/type.
 * onSelect(vehicleId) is called when the user picks a tank.
 */
export default function GaragePicker({ onSelect, selectedId, defaultTier = 1 }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [nation, setNation] = useState('');
  const [tier, setTier] = useState(defaultTier);
  const [type, setType] = useState('');

  const fetchVehicles = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = {};
    if (tier) params.tier = tier;
    if (nation) params.nation = nation;
    if (type) params.type = type;
    axios
      .get('/api/vehicles', { params })
      .then(res => {
        setVehicles(Array.isArray(res.data) ? res.data : Object.values(res.data));
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [tier, nation, type]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  return (
    <div className="garage-picker">
      <div className="garage-picker__filters">
        <label>
          Nation
          <select value={nation} onChange={e => setNation(e.target.value)}>
            <option value="">All</option>
            {NATIONS.map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>

        <label>
          Tier
          <select value={tier} onChange={e => setTier(Number(e.target.value))}>
            <option value={0}>All</option>
            {Array.from({ length: 10 }, (_, i) => i + 1).map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>

        <label>
          Type
          <select value={type} onChange={e => setType(e.target.value)}>
            <option value="">All</option>
            {TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
      </div>

      {loading && <p className="garage-picker__status">Loading vehicles…</p>}
      {error && (
        <p className="garage-picker__status garage-picker__status--error">
          Failed to load vehicles.{' '}
          <button onClick={fetchVehicles}>Retry</button>
        </p>
      )}

      {!loading && !error && vehicles.length === 0 && (
        <p className="garage-picker__status">No vehicles match the selected filters.</p>
      )}

      <ul className="garage-picker__list">
        {vehicles.map(v => (
          <li
            key={v.vehicleId ?? v.tankId ?? v.id}
            className={
              'garage-picker__item' +
              (String(v.vehicleId ?? v.tankId ?? v.id) === String(selectedId)
                ? ' garage-picker__item--selected'
                : '')
            }
            onClick={() => onSelect(String(v.vehicleId ?? v.tankId ?? v.id))}
          >
            <span className="garage-picker__name">{v.name ?? v.shortName ?? 'Unknown'}</span>
            <span className="garage-picker__meta">
              {v.nation} · Tier {v.tier} · {v.type}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
