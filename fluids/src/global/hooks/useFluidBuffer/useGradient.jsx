import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import { Uniform } from "three";

import useShaderPass from "./useShaderPass";
import gradientFrag from "./shaders/gradient.frag?raw";

const useGradient = ({ gridScale, pressureFBO, velocityFBO, outputFBO }) => {
  const uniforms = useMemo(() => {
    return {
      uGridScale: new Uniform(gridScale),
      uPressure: new Uniform(pressureFBO.texture),
      uVelocity: new Uniform(velocityFBO.texture),
    };
  }, [gridScale, pressureFBO, velocityFBO]);

  const gradientTextureRef = useShaderPass({
    fragmentShader: gradientFrag,
    uniforms,
    fbo: outputFBO,
  });

  useFrame(() => {
    uniforms.uPressure.value = pressureFBO.texture;
    uniforms.uVelocity.value = velocityFBO.texture;
  });

  return gradientTextureRef;
};

export default useGradient;
