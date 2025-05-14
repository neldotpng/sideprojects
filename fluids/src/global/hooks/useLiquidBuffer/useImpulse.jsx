import { useFrame, useThree } from "@react-three/fiber";
import { useMemo } from "react";
import { Uniform, Vector2 } from "three";

import { useMouseStore } from "@/global/Stores";
import useShaderPass from "./useShaderPass";

import impulseFrag from "./shaders/impulse.frag?raw";

const c_size = 100;
const c_force = 20;

const useImpulse = ({ gridScale, inputFBO, outputFBO }) => {
  const { size } = useThree();
  const { mouseData } = useMouseStore();

  const uniforms = useMemo(() => {
    return {
      uResolution: new Uniform(new Vector2(size.width, size.height)),
      uGridScale: new Uniform(gridScale),
      uVelocity: new Uniform(inputFBO.texture),
      uForce: new Uniform(c_force),
      uSize: new Uniform(c_size),
      uDelta: new Uniform(new Vector2(0, 0)),
      uPosition: new Uniform(new Vector2(0, 0)),
    };
  }, [gridScale, inputFBO, size]);

  const impulseTexture = useShaderPass({
    fragmentShader: impulseFrag,
    uniforms,
    fbo: outputFBO,
  });

  useFrame(() => {
    if (!mouseData.current) return;
    uniforms.uVelocity.value = inputFBO.texture;

    const { delta, position } = mouseData.current;

    uniforms.uDelta.value.copy(delta);
    uniforms.uPosition.value.copy(position);
  });

  return impulseTexture;
};

export default useImpulse;
