import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import { useFBO } from "@react-three/drei";
import { LinearFilter, FloatType, RGBAFormat, Uniform } from "three";

import useShaderPass from "./useShaderPass";
import advectionFrag from "./shaders/advection.frag?raw";

const useAdvection = ({
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
  inputFBO,
}) => {
  const advection = useFBO(resolution, resolution, options);

  const uniforms = useMemo(() => {
    return {
      uCellScale: new Uniform(cellScale),
      uVelocity: new Uniform(inputFBO.texture),
      uDeltaTime: new Uniform(0),
      uDissipation: new Uniform(0.99),
      uGridScale: new Uniform(0.25),
    };
  }, [cellScale, inputFBO]);

  const advectionRef = useShaderPass({
    fragmentShader: advectionFrag,
    uniforms,
    fbo: advection,
    drawBoundary: true,
  });

  useFrame((state, dt) => {
    uniforms.uVelocity.value = inputFBO.texture;
    uniforms.uDeltaTime.value = dt;
  });

  return advectionRef;
};

export default useAdvection;
