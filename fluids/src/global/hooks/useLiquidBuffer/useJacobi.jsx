import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import { Uniform } from "three";

import useShaderPass from "./useShaderPass";
import jacobiFrag from "./shaders/jacobi.frag?raw";

const useJacobi = ({ inputFBO, outputFBO, tempFBO, iterations = 20, alpha, beta }) => {
  const uniforms = useMemo(() => {
    return {
      uX: new Uniform(null),
      uB: new Uniform(inputFBO.texture),
      uAlpha: new Uniform(alpha),
      uBeta: new Uniform(beta),
    };
  }, [inputFBO, alpha, beta]);

  const jacobiRef = useShaderPass({
    fragmentShader: jacobiFrag,
    uniforms,
    uniformToUpdate: "uX",
    fbo: outputFBO,
    swapFBO: tempFBO,
    iterations: iterations,
  });

  useFrame(() => {
    uniforms.uB.value = inputFBO.texture;
  });

  return jacobiRef;
};

export default useJacobi;
