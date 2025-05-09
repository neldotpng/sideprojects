import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import { useFBO } from "@react-three/drei";
import * as THREE from "three";

import { useMouseStore } from "@/global/Stores";
import useShaderPass from "./useShaderPass";

import impulseVert from "./shaders/impulse.vert?raw";
import impulseFrag from "./shaders/impulse.frag?raw";

const c_size = 200;
const c_force = 20;

const useImpulse = ({ cellScale }) => {
  const { mouseData } = useMouseStore();
  const impulse = useFBO();

  const uniforms = useMemo(() => {
    return {
      uDelta: new THREE.Uniform(new THREE.Vector2(0, 0)),
      uForce: new THREE.Uniform(new THREE.Vector2(0, 0)),
      uCenter: new THREE.Uniform(new THREE.Vector2(0, 0)),
      uScale: new THREE.Uniform(new THREE.Vector2(0, 0)),
      uPx: new THREE.Uniform(cellScale),
    };
  }, [cellScale]);

  useShaderPass({
    vertexShader: impulseVert,
    fragmentShader: impulseFrag,
    uniforms,
    fbo: impulse,
  });

  useFrame(() => {
    if (!mouseData.current) return;

    const { delta, position } = mouseData.current;
    const cursorSize = cellScale.clone().multiplyScalar(c_size);

    const maxX = 1 - cursorSize.x / 2 - cellScale.x;
    const maxY = 1 - cursorSize.y / 2 - cellScale.y;

    uniforms.uDelta.value.copy(delta);
    uniforms.uCenter.value.set(
      Math.min(Math.max(position.x, -maxX), maxX),
      Math.min(Math.max(position.y, -maxY), maxY)
    );
    uniforms.uForce.value.set(delta.x * c_force, delta.y * c_force);
    uniforms.uScale.value.copy(cursorSize);
  });

  return impulse;
};

export default useImpulse;
