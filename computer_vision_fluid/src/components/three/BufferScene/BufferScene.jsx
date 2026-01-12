import { useThree, useFrame, createPortal } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const BufferScene = ({ children, fbo }) => {
  const { gl, camera } = useThree();
  const bufferScene = useRef(new THREE.Scene());
  const portal = useMemo(() => {
    return createPortal(children, bufferScene.current);
  }, [children]);

  useFrame(() => {
    if (!bufferScene.current) return;

    gl.setRenderTarget(fbo);
    gl.clear();
    gl.render(bufferScene.current, camera);
    gl.setRenderTarget(null);
  }, -1);

  return <>{portal}</>;
};

export default BufferScene;
