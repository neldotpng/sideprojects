import { useFrame, useThree } from "@react-three/fiber";
import { useMemo } from "react";
import { Uniform, Vector2 } from "three";

import useShaderPass from "./useShaderPass";

import impulseFrag from "./shaders/impulse.frag?raw";

const useImpulse = ({
  cursorSize = 100,
  cursorForce = 20,
  inputFBO,
  outputFBO,
  audioData,
  pingPongTexture,
}) => {
  const { size } = useThree();

  const uniforms = useMemo(() => {
    return {
      uResolution: new Uniform(new Vector2(size.width, size.height)),
      uVelocity: new Uniform(inputFBO.texture),
      uForce: new Uniform(cursorForce),
      uSize: new Uniform(cursorSize),
      uPingPongTexture: new Uniform(pingPongTexture.current),
      uAudioBin0: new Uniform(0),
      uAudioBin1: new Uniform(0),
      uAudioBin2: new Uniform(0),
      uAudioBin3: new Uniform(0),
      uAudioBin4: new Uniform(0),
      uAudioBin5: new Uniform(0),
      uAudioBin6: new Uniform(0),
      uAudioBin7: new Uniform(0),
      uAudioBin8: new Uniform(0),
      uTime: new Uniform(0),
    };
  }, [cursorSize, cursorForce, inputFBO, size, pingPongTexture]);

  const impulseTextureRef = useShaderPass({
    fragmentShader: impulseFrag,
    uniforms,
    fbo: outputFBO,
  });

  useFrame((state, dt) => {
    uniforms.uTime.value += dt;

    uniforms.uVelocity.value = inputFBO.texture;
    uniforms.uPingPongTexture.value = pingPongTexture.current;

    for (let i = 0; i < audioData.binStrengths.current.length; i++) {
      uniforms[`uAudioBin${i}`].value = audioData.binStrengths.current[i];
    }
  });

  return impulseTextureRef;
};

export default useImpulse;
