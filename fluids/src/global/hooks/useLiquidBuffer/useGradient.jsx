import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import { useFBO } from "@react-three/drei";
import { LinearFilter, FloatType, RGBAFormat, Uniform } from "three";

import useShaderPass from "./useShaderPass";
import gradientFrag from "./shaders/gradient.frag?raw";

const useGradient = ({
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
  pressureTexture,
  velocityTexture,
}) => {
  const gradient = useFBO(resolution, resolution, options);

  const uniforms = useMemo(() => {
    return {
      uCellScale: new Uniform(cellScale),
      uPressure: new Uniform(pressureTexture.current),
      uVelocity: new Uniform(velocityTexture.current),
    };
  }, [cellScale, pressureTexture, velocityTexture]);

  const gradientRef = useShaderPass({
    fragmentShader: gradientFrag,
    uniforms,
    fbo: gradient,
  });

  useFrame(() => {
    uniforms.uPressure.value = pressureTexture.current;
    uniforms.uVelocity.value = velocityTexture.current;
  });

  return gradientRef;
};

export default useGradient;
