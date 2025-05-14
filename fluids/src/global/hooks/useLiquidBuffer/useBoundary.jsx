import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import { Uniform } from "three";

import useShaderPass from "./useShaderPass";
import boundaryFrag from "./shaders/boundary.frag?raw";

const useBoundary = ({ cellScale, offset, scale, inputFBO, outputFBO }) => {
  const uniforms = useMemo(() => {
    return {
      uCellScale: new Uniform(cellScale),
      uTexture: new Uniform(inputFBO.texture),
      uOffset: new Uniform(offset),
      uScale: new Uniform(scale),
    };
  }, [cellScale, offset, scale, inputFBO]);

  const boundaryRef = useShaderPass({
    fragmentShader: boundaryFrag,
    uniforms,
    fbo: outputFBO,
  });

  useFrame(() => {
    uniforms.uVelocity.value = inputFBO.texture;
  });

  return boundaryRef;
};

export default useBoundary;
