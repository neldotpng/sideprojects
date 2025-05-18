import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import { Uniform } from "three";

import useShaderPass from "./useShaderPass";
import jacobiFrag from "./shaders/jacobi.frag?raw";

const useJacobi = ({
  iterations = 20,
  alpha = -0.3 * 0.3,
  beta = 4,
  alphaRef,
  betaRef,
  inputFBO,
  outputFBO,
  tempFBO,
}) => {
  const uniforms = useMemo(() => {
    return {
      uX: new Uniform(null),
      uB: new Uniform(inputFBO.texture),
      uAlpha: new Uniform(alphaRef ? alphaRef.current : alpha),
      uBeta: new Uniform(betaRef ? betaRef.current : beta),
    };
  }, [inputFBO, alpha, beta, alphaRef, betaRef]);

  const jacobiTextureRef = useShaderPass({
    fragmentShader: jacobiFrag,
    uniforms,
    uniformToUpdate: "uX",
    fbo: outputFBO,
    swapFBO: tempFBO,
    iterations,
  });

  useFrame(() => {
    if (alphaRef && betaRef) {
      uniforms.uAlpha.value = alphaRef.current;
      uniforms.uBeta.value = betaRef.current;
    }
    uniforms.uB.value = inputFBO.texture;
  });

  return jacobiTextureRef;
};

export default useJacobi;
