import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import { useFBO } from "@react-three/drei";
import { LinearFilter, FloatType, RGBAFormat, Uniform } from "three";

import useShaderPass from "./useShaderPass";
import boundaryFrag from "./shaders/boundary.frag?raw";

const useBoundary = ({
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
  const boundary = useFBO(resolution, resolution, options);

  const uniforms = useMemo(() => {
    return {
      uCellScale: new Uniform(cellScale),
      uVelocity: new Uniform(inputTexture.current),
    };
  }, [cellScale, inputTexture]);

  const boundaryRef = useShaderPass({
    fragmentShader: boundaryFrag,
    uniforms,
    fbo: boundary,
  });

  useFrame(() => {
    uniforms.uVelocity.value = inputTexture.current;
  });

  return boundaryRef;
};

export default useBoundary;
