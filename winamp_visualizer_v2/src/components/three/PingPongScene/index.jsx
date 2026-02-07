import { useRef, useMemo, useLayoutEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";

import CustomShaderMaterial from "@/global/materials/CustomShaderMaterial";
import bufferFunctions from "./shaders/includes/functions.glsl?raw";
import bufferVertexShader from "./shaders/pingpong/vertexShader.glsl?raw";
import bufferFragmentShader from "./shaders/pingpong/fragmentShader.glsl?raw";
import vertexShader from "./shaders/vertexShader.glsl?raw";
import fragmentShader from "./shaders/fragmentShader.glsl?raw";

import usePingPong from "@/global/hooks/usePingPong";

const PingPongScene = ({ audioData, segments = 2 }) => {
  // Used for resizing the plane to fullscreen aspect ratio
  const { viewport } = useThree();

  const plane = useRef();
  const shaderMaterial = useRef();

  // Uniforms for the PingPong bufferMaterial
  const bufferUniforms = useMemo(() => {
    return {
      uFFTTexture: { value: null },
      uAspect: { value: 0 },
      u00: { value: 0 },
      u01: { value: 0 },
      u02: { value: 0 },
      u03: { value: 0 },
      u04: { value: 0 },
      u05: { value: 0 },
      u06: { value: 0 },
      u07: { value: 0 },
      u08: { value: 0 },
      uNyquist: { value: audioData.sampleRate / 2 },
      uPreset: { value: 0 },
      uTimeStrength: { value: 0.1 },
      uFadeStrength: { value: 0.1 },
      uTrailStrength: { value: 0.1 },
    };
  }, [audioData]);

  // Initiate PingPong Hook
  const [texture, bufferMaterial] = usePingPong({
    vertexShader: bufferVertexShader,
    fragmentShader: `${bufferFunctions} ${bufferFragmentShader}`, // Concat functions.glsl and bufferFragmentShader.glsl
    uniforms: bufferUniforms,
  });

  // // Shader Controls
  // useShaderControls({
  //   getMaterials: () => {
  //     return { shaderMaterial: shaderMaterial.current, bufferMaterial: bufferMaterial };
  //   },
  // });

  // Scale Plane to Fullscreen
  useLayoutEffect(() => {
    plane.current.scale.x = viewport.width;
    plane.current.scale.y = viewport.height;
    bufferMaterial.uniforms.uAspect.value = viewport.width / viewport.height;
  }, [viewport, bufferMaterial]);

  useFrame((state, delta) => {
    const { textureData, binStrengths } = audioData;
    if (textureData) {
      binStrengths.current.forEach((strength, i) => {
        bufferMaterial.uniforms[`u0${i}`].value = strength;
        shaderMaterial.current.uniforms[`u0${i}`].value = strength;
      });

      // Uniform updates for bufferMaterial
      bufferMaterial.uniforms.uFFTTexture.value = textureData;

      // Uniforms for customShaderMaterial
      shaderMaterial.current.uniforms.uTime.value += delta;
      shaderMaterial.current.uniforms.uFFTTexture.value = textureData;
    }

    if (texture) {
      shaderMaterial.current.uniforms.uTexture.value = texture.current;
    }
  });

  return (
    <mesh ref={plane}>
      <planeGeometry args={[1, 1, segments, segments]} />
      <CustomShaderMaterial
        disableMouse
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uAspect: { value: 0 },
          uTexture: { value: null },
          uFFTTexture: { value: null },
          u00: { value: 0 },
          u01: { value: 0 },
          u02: { value: 0 },
          u03: { value: 0 },
          u04: { value: 0 },
          u05: { value: 0 },
          u06: { value: 0 },
          u07: { value: 0 },
          u08: { value: 0 },
          uEnergy: { value: 0 },
          uNyquist: { value: audioData.sampleRate / 2 },
        }}
        ref={shaderMaterial}
      />
    </mesh>
  );
};

export default PingPongScene;
