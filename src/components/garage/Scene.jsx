import React, { Suspense, useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Grid } from '@react-three/drei';
import * as THREE from 'three';

function AxesHelper() {
  return <axesHelper args={[3]} />;
}

/** Adjusts camera position to frame the model after bounds are known. */
function CameraRig({ center, size }) {
  const { camera } = useThree();
  useEffect(() => {
    if (!center || !size) return;
    const dist = Math.max(size.x, size.y, size.z) * 2.5;
    camera.position.set(
      center.x + dist * 0.5,
      center.y + dist * 0.4,
      center.z + dist
    );
    camera.lookAt(center);
  }, [center, size, camera]);
  return null;
}

/** Renders the GLTF scene and reports bbox back to Scene. */
function TankModel({ url, onBoundsReady }) {
  const { scene } = useGLTF(url);
  const ref = useRef();

  useEffect(() => {
    if (!ref.current || !onBoundsReady) return;
    const box = new THREE.Box3().setFromObject(ref.current);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    onBoundsReady(center, size);
  }, [url, onBoundsReady]);

  return <primitive ref={ref} object={scene} dispose={null} />;
}

/**
 * R3F garage scene.
 *
 * Props:
 *   modelUrl    – GLB URL from useTankGltf; null while loading
 *   tankopedia  – exposed for garage-interaction overlays (passed via children context)
 *   armor       – exposed for garage-interaction armor overlays
 *   shellTypes  – exposed for garage-interaction shell panel
 *   loading     – shows spinner overlay
 *   error       – shows error + retry overlay
 *   retry       – called when user clicks retry
 *   children    – rendered inside the Canvas so garage-interaction can add R3F objects
 */
export default function Scene({
  modelUrl,
  loading,
  error,
  retry,
  children,
}) {
  const [bounds, setBounds] = useState(null);
  const controlsRef = useRef();

  const handleBoundsReady = useCallback((center, size) => {
    setBounds({ center, size });
    if (controlsRef.current) {
      controlsRef.current.target.copy(center);
      controlsRef.current.update();
    }
  }, []);

  return (
    <div className="garage-scene">
      {loading && (
        <div className="garage-scene__overlay">
          <div className="garage-scene__spinner" aria-label="Loading tank model" />
        </div>
      )}
      {error && !loading && (
        <div className="garage-scene__overlay garage-scene__overlay--error">
          <p>Failed to load tank model.</p>
          <button onClick={retry}>Retry</button>
        </div>
      )}

      <Canvas
        gl={{
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1,
        }}
        camera={{ fov: 45, near: 0.1, far: 1000, position: [0, 5, 10] }}
        shadows
      >
        <ambientLight intensity={0.4} />
        <hemisphereLight args={['#b1e1ff', '#444444', 0.6]} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />

        {/* 1 m grid on XZ plane; axes oriented Y-up, Z-forward */}
        <Grid
          cellSize={1}
          sectionSize={5}
          sectionColor="#888"
          cellColor="#555"
          infiniteGrid
          fadeDistance={40}
        />
        <AxesHelper />

        {bounds && <CameraRig center={bounds.center} size={bounds.size} />}

        <OrbitControls ref={controlsRef} makeDefault />

        {modelUrl && !loading && !error && (
          <Suspense fallback={null}>
            <TankModel url={modelUrl} onBoundsReady={handleBoundsReady} />
          </Suspense>
        )}

        {children}
      </Canvas>
    </div>
  );
}
