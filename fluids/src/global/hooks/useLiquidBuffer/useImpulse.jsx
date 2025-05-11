import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import { useFBO } from "@react-three/drei";
import { LinearFilter, FloatType, RGBAFormat, Uniform, Vector2 } from "three";

import { useMouseStore } from "@/global/Stores";
import useShaderPass from "./useShaderPass";

import impulseVert from "./shaders/impulse.vert?raw";
import impulseFrag from "./shaders/impulse.frag?raw";

const c_size = 200;
const c_force = 20;

const useImpulse = ({
  cellScale,
  resolution = 256,
  options = {
    stencilBuffer: false,
    depthBuffer: false,
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    type: FloatType,
    format: RGBAFormat,
  },
}) => {
  const { mouseData } = useMouseStore();
  const impulse = useFBO(resolution, resolution, options);

  const uniforms = useMemo(() => {
    return {
      uDelta: new Uniform(new Vector2(0, 0)),
      uForce: new Uniform(new Vector2(0, 0)),
      uCenter: new Uniform(new Vector2(0, 0)),
      uScale: new Uniform(new Vector2(0, 0)),
      uCellScale: new Uniform(cellScale),
    };
  }, [cellScale]);

  const impulseTexture = useShaderPass({
    vertexShader: impulseVert,
    fragmentShader: impulseFrag,
    uniforms,
    fbo: impulse,
  });

  useFrame(() => {
    if (!mouseData.current) return;

    const { delta, position } = mouseData.current;
    const cursorSize = cellScale.clone().multiplyScalar(c_size);

    const maxX = 1 - cursorSize.x - cellScale.x;
    const maxY = 1 - cursorSize.y - cellScale.y;

    uniforms.uDelta.value.copy(delta);
    uniforms.uCenter.value.set(
      Math.min(Math.max(position.x, -maxX), maxX),
      Math.min(Math.max(position.y, -maxY), maxY)
    );
    uniforms.uForce.value.set(delta.x * c_force, delta.y * c_force);
    uniforms.uScale.value.copy(cursorSize);
  });

  return impulseTexture;
};

export default useImpulse;
