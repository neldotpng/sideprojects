import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import { useFBO } from "@react-three/drei";
import { LinearFilter, FloatType, RGBAFormat, Uniform } from "three";

import useShaderPass from "./useShaderPass";
import divergenceFrag from "./shaders/divergence.frag?raw";

const useDivergence = ({
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
  const divergence = useFBO(resolution, resolution, options);

  const uniforms = useMemo(() => {
    return {
      uCellScale: new Uniform(cellScale),
      uVelocity: new Uniform(inputTexture.current),
    };
  }, [cellScale, inputTexture]);

  const divergenceRef = useShaderPass({
    fragmentShader: divergenceFrag,
    uniforms,
    fbo: divergence,
  });

  useFrame(() => {
    uniforms.uVelocity.value = inputTexture.current;
  });

  return divergenceRef;
};

export default useDivergence;
