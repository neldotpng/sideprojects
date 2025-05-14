import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import { Uniform } from "three";

import useShaderPass from "./useShaderPass";
import advectionFrag from "./shaders/advection.frag?raw";

const useAdvection = ({ gridScale, drawBoundaries = true, inputFBO, outputFBO }) => {
  const uniforms = useMemo(() => {
    return {
      uGridScale: new Uniform(gridScale),
      uVelocity: new Uniform(inputFBO.texture),
      uDeltaTime: new Uniform(0),
      uDissipation: new Uniform(0.99),
    };
  }, [gridScale, inputFBO]);

  const advectionRef = useShaderPass({
    fragmentShader: advectionFrag,
    uniforms,
    fbo: outputFBO,
    drawBoundaries,
  });

  useFrame((state, dt) => {
    uniforms.uVelocity.value = inputFBO.texture;
    uniforms.uDeltaTime.value = dt;
  });

  return advectionRef;
};

export default useAdvection;
