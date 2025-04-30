import { useThree, useFrame, createPortal } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";

const BufferScene = ({ children, fbo }) => {
  const { gl, camera } = useThree();
  const bufferScene = useMemo(() => new THREE.Scene(), []);

  const portal = createPortal(children, bufferScene);

  useFrame(() => {
    gl.setRenderTarget(fbo);
    gl.clear();
    gl.render(bufferScene, camera);
    gl.setRenderTarget(null);
  });

  return <>{portal}</>;
};

export default BufferScene;
