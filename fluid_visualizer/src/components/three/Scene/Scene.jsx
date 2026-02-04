import { useEffect, useRef, useState, useMemo } from "react";
import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Color } from "three";

import Debug from "@/global/Debug";
import Background from "../Background/Background";
import Grass from "../Grass/Grass";
import useFluidBuffer from "@/global/hooks/useFluidBuffer";
import useGestureControls from "@/global/hooks/useGestureControls";
import useFFTTexture from "@/global/hooks/useFFTTexture";

import bufferFunctions from "./shaders/includes/functions.glsl?raw";
import bufferVertexShader from "./shaders/pingpong/vertexShader.glsl?raw";
import bufferFragmentShader from "./shaders/pingpong/fragmentShader.glsl?raw";
import usePingPong from "@/global/hooks/usePingPong";

import PingPongScene from "../PingPongScene";

import { useGestureControlsStore } from "@/global/Stores";

const Scene = () => {
  // Init FFTTexture
  const audioData = useFFTTexture("/audio/17.mp3", 2048);

  // Uniforms for the PingPong bufferMaterial
  const bufferUniforms = useMemo(() => {
    return {
      uFFTTexture: { value: null },
      uAspect: { value: 0 },
      uPreset: { value: 0 },
      uNyquist: { value: audioData.sampleRate },
      uTimeStrength: { value: 0.1 },
      uFadeStrength: { value: 0.1 },
      uTrailStrength: { value: 0.1 },
    };
  }, [audioData]);

  // Initiate PingPong Hook
  const [pingPongTexture, bufferMaterial] = usePingPong({
    vertexShader: bufferVertexShader,
    fragmentShader: `${bufferFunctions} ${bufferFragmentShader}`, // Concat functions.glsl and bufferFragmentShader.glsl
    uniforms: bufferUniforms,
  });

  // Init Fluid Sim
  const { velocity } = useFluidBuffer({ audioData: audioData, pingPongTexture: pingPongTexture });

  // GestureControl States
  const [streamStarted, setStreamStarted] = useState(false);
  const [hovered, setHovered] = useState(false);
  const textRef = useRef();

  // Init GestureControls
  const [startStream, gestureControlsDataRef] = useGestureControls();

  // Init GestureControlsStore
  useEffect(() => {
    useGestureControlsStore.setState({ gestureControlsData: gestureControlsDataRef });
  }, [gestureControlsDataRef]);

  const onClick = () => {
    startStream();
    setStreamStarted(true);
    setHovered(false);
  };

  useEffect(() => {
    if (hovered) document.body.style.cursor = "pointer";
    return () => (document.body.style.cursor = "auto");
  }, [hovered]);

  useFrame(() => {
    const { textureData } = audioData;
    if (textureData) bufferMaterial.uniforms.uFFTTexture.value = textureData;

    if (!streamStarted)
      textRef.current.material.color.lerp(new Color().set(hovered ? "red" : "white"), 0.1);
  });

  return (
    <>
      <Debug />

      <Background fluidTexture={velocity.texture} />
      <Grass fluidTexture={velocity.texture} />

      {!streamStarted && (
        <Text
          ref={textRef}
          fontSize={0.5}
          fontWeight={700}
          textAlign="center"
          onClick={onClick}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}>
          click to start
        </Text>
      )}

      {/* <PingPongScene audioData={audioData} /> */}
    </>
  );
};

export default Scene;
