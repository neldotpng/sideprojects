import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import { Uniform } from "three";

import useShaderPass from "./useShaderPass";
import advectionFrag from "./shaders/advection.frag?raw";

const useAdvection = ({ step, inputFBO, outputFBO }) => {
  const uniforms = useMemo(() => {
    return {
      uStep: new Uniform(step),
      uVelocity: new Uniform(inputFBO.texture),
      uDeltaTime: new Uniform(0),
      uDissipation: new Uniform(0.99),
    };
  }, [step, inputFBO]);

  const advectionTextureRef = useShaderPass({
    fragmentShader: advectionFrag,
    uniforms,
    fbo: outputFBO,
  });

  useFrame((state, dt) => {
    uniforms.uVelocity.value = inputFBO.texture;
    uniforms.uDeltaTime.value = dt;
  });

  return advectionTextureRef;
};

export default useAdvection;
