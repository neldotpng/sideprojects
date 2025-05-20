import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import { Uniform } from "three";

import useShaderPass from "./useShaderPass";
import advectionFrag from "./shaders/advection.frag?raw";

const useAdvection = ({ step = 0.3, dissipation = 0.99, inputFBO, outputFBO }) => {
  const uniforms = useMemo(() => {
    return {
      uStep: new Uniform(step),
      uVelocity: new Uniform(inputFBO.texture),
      uDissipation: new Uniform(dissipation),
    };
  }, [step, dissipation, inputFBO]);

  const advectionTextureRef = useShaderPass({
    fragmentShader: advectionFrag,
    uniforms,
    fbo: outputFBO,
  });

  useFrame(() => {
    uniforms.uVelocity.value = inputFBO.texture;
  });

  return advectionTextureRef;
};

export default useAdvection;
