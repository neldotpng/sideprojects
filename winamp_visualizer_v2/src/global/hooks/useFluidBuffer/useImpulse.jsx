import { useFrame, useThree } from "@react-three/fiber";
import { useMemo } from "react";
import { Uniform, Vector2, Vector4 } from "three";

import { useGestureControlsStore } from "@/global/Stores";
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
  const { gestureControlsData } = useGestureControlsStore();

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
      uImpulse00: new Uniform(new Vector4(0, 0, 0, 0)),
      uImpulse01: new Uniform(new Vector4(0, 0, 0, 0)),
      uImpulse02: new Uniform(new Vector4(0, 0, 0, 0)),
      uImpulse03: new Uniform(new Vector4(0, 0, 0, 0)),
      uImpulse04: new Uniform(new Vector4(0, 0, 0, 0)),
      uImpulse10: new Uniform(new Vector4(0, 0, 0, 0)),
      uImpulse11: new Uniform(new Vector4(0, 0, 0, 0)),
      uImpulse12: new Uniform(new Vector4(0, 0, 0, 0)),
      uImpulse13: new Uniform(new Vector4(0, 0, 0, 0)),
      uImpulse14: new Uniform(new Vector4(0, 0, 0, 0)),
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

    if (!gestureControlsData.current) return;
    uniforms.uVelocity.value = inputFBO.texture;
    uniforms.uPingPongTexture.value = pingPongTexture.current;

    gestureControlsData.current.forEach((hand, i) => {
      hand.fingers.forEach((finger, j) => {
        const { position, delta } = finger;
        uniforms[`uImpulse${i}${j}`].value.set(position.x, position.y, delta.x, delta.y);
      });
    });

    for (let i = 0; i < audioData.binStrengths.current.length; i++) {
      uniforms[`uAudioBin${i}`].value = audioData.binStrengths.current[i];
    }
  });

  return impulseTextureRef;
};

export default useImpulse;
