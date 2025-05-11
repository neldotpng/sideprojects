import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import { useFBO } from "@react-three/drei";
import { LinearFilter, FloatType, RGBAFormat, Uniform } from "three";

import useShaderPass from "./useShaderPass";

import outputVert from "./shaders/output.vert?raw";
import jacobiFrag from "./shaders/jacobi.frag?raw";

const useJacobi = ({
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
  inTexture,
}) => {
  const jacobi = useFBO(resolution, resolution, options);
  const jacobiSwap = useFBO(resolution, resolution, options);

  const uniforms = useMemo(() => {
    return {
      uVelocity: new Uniform(inTexture.current),
      uQuantity: new Uniform(inTexture.current),
      uAlpha: new Uniform(-cellScale.x * cellScale.x),
      uBeta: new Uniform(4 + -cellScale.x * cellScale.x),
      uTest: new Uniform(null),
    };
  }, [inTexture, cellScale]);

  const jacobiRef = useShaderPass({
    vertexShader: outputVert,
    fragmentShader: jacobiFrag,
    uniforms,
    fbo: jacobi,
    swapFBO: jacobiSwap,
    iterations: 20,
  });

  useFrame(() => {
    uniforms.uVelocity.value = inTexture.current;
  });

  return jacobiRef;
};

export default useJacobi;
