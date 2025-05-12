import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import { useFBO } from "@react-three/drei";
import { LinearFilter, FloatType, RGBAFormat, Uniform, Vector2 } from "three";

import { useMouseStore } from "@/global/Stores";
import useShaderPass from "./useShaderPass";

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
  inputTexture,
}) => {
  const { mouseData } = useMouseStore();
  const impulse = useFBO(resolution, resolution, options);

  const uniforms = useMemo(() => {
    return {
      uCellScale: new Uniform(cellScale),
      uVelocity: new Uniform(inputTexture.current),
      uForce: new Uniform(c_force),
      uSize: new Uniform(c_size),
      uDelta: new Uniform(new Vector2(0, 0)),
      uPosition: new Uniform(new Vector2(0, 0)),
    };
  }, [cellScale, inputTexture]);

  const impulseTexture = useShaderPass({
    fragmentShader: impulseFrag,
    uniforms,
    fbo: impulse,
  });

  useFrame(() => {
    if (!mouseData.current) return;
    uniforms.uVelocity.value = inputTexture.current;

    const { delta, position } = mouseData.current;

    uniforms.uDelta.value.copy(delta);
    uniforms.uPosition.value.copy(position);
  });

  return impulseTexture;
};

export default useImpulse;
