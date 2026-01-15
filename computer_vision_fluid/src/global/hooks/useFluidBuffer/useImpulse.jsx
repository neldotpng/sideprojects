import { useFrame, useThree } from "@react-three/fiber";
import { useMemo } from "react";
import { Uniform, Vector2 } from "three";

import { useGestureControlsStore } from "@/global/Stores";
import useShaderPass from "./useShaderPass";

import impulseFrag from "./shaders/impulse.frag?raw";

const useImpulse = ({ cursorSize = 100, cursorForce = 20, inputFBO, outputFBO }) => {
  const { size } = useThree();
  const { gestureControlsData } = useGestureControlsStore();

  const uniforms = useMemo(() => {
    return {
      uResolution: new Uniform(new Vector2(size.width, size.height)),
      uVelocity: new Uniform(inputFBO.texture),
      uForce: new Uniform(cursorForce),
      uSize: new Uniform(cursorSize),
      uDelta: new Uniform(new Vector2(0, 0)),
      uPosition: new Uniform(new Vector2(0, 0)),
    };
  }, [cursorSize, cursorForce, inputFBO, size]);

  const impulseTextureRef = useShaderPass({
    fragmentShader: impulseFrag,
    uniforms,
    fbo: outputFBO,
  });

  useFrame(() => {
    if (!gestureControlsData.current) return;
    uniforms.uVelocity.value = inputFBO.texture;

    const test = gestureControlsData.current[0][0];

    uniforms.uDelta.value.copy(test.delta);
    uniforms.uPosition.value.copy(test.position);
  });

  return impulseTextureRef;
};

export default useImpulse;
