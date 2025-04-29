import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

import * as THREE from "three";

// Can only be used inside Canvas
const useMouse = (normalized = false) => {
  const mousePos = useRef(new THREE.Vector2(0, 0));

  useFrame(({ pointer }) => {
    const uvPointer = pointer.clone().addScalar(1).divideScalar(2);
    if (mousePos.current.equals(uvPointer) || mousePos.current.equals(pointer)) return;

    if (normalized) {
      mousePos.current.set(pointer.x, pointer.y);
    } else {
      mousePos.current.set(uvPointer.x, uvPointer.y);
    }
  });

  return mousePos;
};

export default useMouse;
