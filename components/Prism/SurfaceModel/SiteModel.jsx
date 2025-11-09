import React, { useEffect, useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { clone } from "three/examples/jsm/utils/SkeletonUtils";
import * as THREE from "three";

const SiteModel = ({ url, onBoundingBoxComputed }) => {
  const glb = useLoader(GLTFLoader, url);

  const clonedScene = useMemo(() => clone(glb.scene), [glb]);

  useEffect(() => {
    if (!clonedScene) return;
    const bbox = new THREE.Box3().setFromObject(clonedScene);
    onBoundingBoxComputed?.(bbox);
  }, [clonedScene, onBoundingBoxComputed]);

  return (
    <primitive
      object={clonedScene}
      scale={[1, 1, 1]}
      position={[0, 0, 0]}
    />
  );
};

export default SiteModel;
