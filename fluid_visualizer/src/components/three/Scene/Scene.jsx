import { useEffect, useRef, useState } from "react";
import { Color } from "three";

import Debug from "@/global/Debug";
import Background from "../Background/Background";
import Grass from "../Grass/Grass";
import useFluidBuffer from "@/global/hooks/useFluidBuffer";
import useGestureControls from "@/global/hooks/useGestureControls";

import PingPongScene from "../PingPongScene";

import { useGestureControlsStore } from "@/global/Stores";
import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

const Scene = () => {
  const { velocity } = useFluidBuffer();
  const [streamStarted, setStreamStarted] = useState(false);
  const [hovered, setHovered] = useState(false);
  const textRef = useRef();

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
      {/* <PingPongScene song={"/audio/07.mp3"} /> */}
    </>
  );
};

export default Scene;
