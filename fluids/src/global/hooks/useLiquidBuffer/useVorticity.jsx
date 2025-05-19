import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import { Uniform } from "three";

import useShaderPass from "./useShaderPass";
import vorticityFrag from "./shaders/vorticity.frag?raw";

const useVorticity = ({ strength, inputFBO, outputFBO }) => {
  const uniforms = useMemo(() => {
    return {
      uStrength: new Uniform(strength),
      uVelocity: new Uniform(inputFBO.texture),
    };
  }, [strength, inputFBO]);

  const vorticityTextureRef = useShaderPass({
    fragmentShader: vorticityFrag,
    uniforms,
    fbo: outputFBO,
  });

  useFrame(() => {
    uniforms.uVelocity.value = inputFBO.texture;
  });

  return vorticityTextureRef;
};

export default useVorticity;
