import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import { Uniform } from "three";

import useShaderPass from "./useShaderPass";
import addVorticityFrag from "./shaders/addVorticity.frag?raw";

const useAddVorticity = ({ gridScale, strength, vorticityFBO, velocityFBO, outputFBO }) => {
  const uniforms = useMemo(() => {
    return {
      uGridScale: new Uniform(gridScale),
      uVelocity: new Uniform(velocityFBO.texture),
      uVorticity: new Uniform(vorticityFBO.texture),
      uStrength: new Uniform(strength),
    };
  }, [gridScale, velocityFBO, vorticityFBO, strength]);

  const addVorticityRef = useShaderPass({
    fragmentShader: addVorticityFrag,
    uniforms,
    fbo: outputFBO,
  });

  useFrame(() => {
    uniforms.uVelocity.value = velocityFBO.texture;
    uniforms.uVorticity.value = vorticityFBO.texture;
  });

  return addVorticityRef;
};

export default useAddVorticity;
