import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import { Uniform } from "three";

import useShaderPass from "./useShaderPass";
import colorFrag from "./shaders/color.frag?raw";

const useColor = ({ inputFBO, outputFBO }) => {
  const uniforms = useMemo(() => {
    return {
      uVelocity: new Uniform(inputFBO.texture),
    };
  }, [inputFBO]);

  const boundaryRef = useShaderPass({
    fragmentShader: colorFrag,
    uniforms,
    fbo: outputFBO,
  });

  useFrame(() => {
    uniforms.uVelocity.value = inputFBO.texture;
  });

  return boundaryRef;
};

export default useColor;
