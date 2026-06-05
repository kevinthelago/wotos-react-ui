import React from 'react';
import { Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import GaragePicker from './GaragePicker';
import Scene from './Scene';
import { useTankGltf } from './useTankGltf';
import './garage.css';

/**
 * Stub auth guard — replaced when fe-auth lands.
 * garage-interaction and auth stream import from here via the garage/index barrel.
 */
export function RequireAuth({ children }) {
  // TODO: replace with auth context check from fe-auth stream
  return children;
}

/** Default tank to show when the user has no saved preference (T-34-85). */
const DEFAULT_VEHICLE_ID = '3393';

function getDefaultVehicleId() {
  return localStorage.getItem('lastGarageVehicleId') ?? DEFAULT_VEHICLE_ID;
}

/** /garage/:vehicleId — picker sidebar + 3D scene */
function GarageSceneView() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const { tankopedia, armor, modelUrl, shellTypes, loading, error, retry } =
    useTankGltf(vehicleId);

  React.useEffect(() => {
    if (vehicleId) {
      localStorage.setItem('lastGarageVehicleId', vehicleId);
    }
  }, [vehicleId]);

  return (
    <div className="garage-layout">
      <aside className="garage-layout__sidebar">
        <GaragePicker
          selectedId={vehicleId}
          onSelect={id => navigate(`/garage/${id}`)}
        />
      </aside>
      <main className="garage-layout__main">
        <Scene
          vehicleId={vehicleId}
          tankopedia={tankopedia}
          armor={armor}
          shellTypes={shellTypes}
          modelUrl={modelUrl}
          loading={loading}
          error={error}
          retry={retry}
        />
      </main>
    </div>
  );
}

/** /garage — redirect to the default vehicle */
function GarageIndex() {
  const defaultId = getDefaultVehicleId();
  return <Navigate to={`/garage/${defaultId}`} replace />;
}

/**
 * Top-level garage component.
 * Mounts at /garage/* in App.jsx.
 * Guards the whole feature with RequireAuth.
 */
export default function Garage() {
  return (
    <RequireAuth>
      <Routes>
        <Route index element={<GarageIndex />} />
        <Route path=":vehicleId" element={<GarageSceneView />} />
      </Routes>
    </RequireAuth>
  );
}
