import { useThree, useFrame, createPortal } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

const BufferScene = ({ children, fbo }) => {
  const { gl, camera } = useThree();
  const bufferScene = useRef(new THREE.Scene());
  const portal = useRef(createPortal(children, bufferScene.current));

  useFrame(() => {
    gl.setRenderTarget(fbo);
    gl.clear();
    gl.render(bufferScene.current, camera);
    gl.setRenderTarget(null);
  }, -1);

  return <>{portal.current}</>;
};

export default BufferScene;
