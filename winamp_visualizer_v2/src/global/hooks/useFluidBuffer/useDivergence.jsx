import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import { Uniform } from "three";

import useShaderPass from "./useShaderPass";
import divergenceFrag from "./shaders/divergence.frag?raw";

const useDivergence = ({ gridScale, inputFBO, outputFBO }) => {
  const uniforms = useMemo(() => {
    return {
      uGridScale: new Uniform(gridScale),
      uVelocity: new Uniform(inputFBO.texture),
    };
  }, [gridScale, inputFBO]);

  const divergenceTextureRef = useShaderPass({
    fragmentShader: divergenceFrag,
    uniforms,
    fbo: outputFBO,
  });

  useFrame(() => {
    uniforms.uVelocity.value = inputFBO.texture;
  });

  return divergenceTextureRef;
};

export default useDivergence;
