import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import { Uniform } from "three";

import useShaderPass from "./useShaderPass";
import addVorticityFrag from "./shaders/addVorticity.frag?raw";

const useAddVorticity = ({
  gridScale = 0.3,
  strength = 1,
  vorticityFBO,
  velocityFBO,
  outputFBO,
}) => {
  const uniforms = useMemo(() => {
    return {
      uGridScale: new Uniform(gridScale),
      uStrength: new Uniform(strength),
      uDeltaTime: new Uniform(0),
      uVorticity: new Uniform(vorticityFBO.texture),
      uVelocity: new Uniform(velocityFBO.texture),
    };
  }, [gridScale, strength, vorticityFBO, velocityFBO]);

  const addVorticityTextureRef = useShaderPass({
    fragmentShader: addVorticityFrag,
    uniforms,
    fbo: outputFBO,
  });

  useFrame((state, dt) => {
    uniforms.uVorticity.value = vorticityFBO.texture;
    uniforms.uVelocity.value = velocityFBO.texture;
    uniforms.uDeltaTime.value = dt;
  });

  return addVorticityTextureRef;
};

export default useAddVorticity;
