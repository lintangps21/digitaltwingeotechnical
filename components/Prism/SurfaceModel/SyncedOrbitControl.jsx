import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import React, { useRef, useEffect } from 'react';
import { useOrbitSync } from './OrbitSyncContext';


const SyncedOrbitControls = ({ source, boundingBox }) => {
  const controlsRef = useRef();
  const { camera } = useThree();
  const { cameraState, setCameraState } = useOrbitSync();
  const initialized = useRef(false); // 🧠 Prevent repeated re-framing

  // Respond to external camera updates
  useEffect(() => {
    if (!source && cameraState && cameraState.position && cameraState.target && controlsRef.current) {
      camera.position.copy(cameraState.position);
      controlsRef.current.target.copy(cameraState.target);
      controlsRef.current.update();
    }
  }, [cameraState, source]);

  // Sync this view's camera outward
  useFrame(() => {
    if (source && controlsRef.current) {
      const newPosition = camera.position.clone();
      const newTarget = controlsRef.current.target.clone();

      const hasChanged =
        !cameraState?.position?.equals(newPosition) ||
        !cameraState?.target?.equals(newTarget);

      if (hasChanged) {
        setCameraState({
          position: newPosition,
          target: newTarget,
        });
      }
    }
  });

  // 🧭 Fit to bounding box ONCE per viewer
  useEffect(() => {
    if (!boundingBox || initialized.current) return;

    const { center, size } = boundingBox;
    const maxDim = Math.max(size.x, size.y, size.z);
    const distance = maxDim * 1.5;

    camera.position.set(center.x, center.y, center.z + distance * 1.5);
    camera.up.set(0, 0, 1);

    camera.near = distance * 0.01;
    camera.far = distance * 10;
    camera.updateProjectionMatrix();

    if (controlsRef.current) {
      controlsRef.current.target.copy(center);
      controlsRef.current.update();
    }

    initialized.current = true;
  }, [boundingBox]);

  return <OrbitControls ref={controlsRef} />;
};

export default SyncedOrbitControls;
