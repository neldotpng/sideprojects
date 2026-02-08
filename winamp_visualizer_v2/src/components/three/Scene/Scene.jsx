import { useEffect, useRef, useState, useMemo } from "react";
import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Color } from "three";
import { useControls, folder, button, buttonGroup } from "leva";

import Debug from "@/global/Debug";
import Background from "../Background/Background";
import useFluidBuffer from "@/global/hooks/useFluidBuffer";
import useFFTTexture from "@/global/hooks/useFFTTexture";

import bufferFunctions from "./shaders/includes/functions.glsl?raw";
import bufferVertexShader from "./shaders/pingpong/vertexShader.glsl?raw";
import bufferFragmentShader from "./shaders/pingpong/fragmentShader.glsl?raw";
import usePingPong from "@/global/hooks/usePingPong";

import PingPongScene from "../PingPongScene";

const SONG_OPTIONS = {
  "Kayoh - Find A Way": "/audio/00.mp3",
  "Sevyn Streeter Ft. Chris Brown - It Won't Stop (Manila Killa & Hunt for the Breeze Remix)":
    "/audio/01.mp3",
  "Track 3": "/audio/02.mp3",
  "Madeon - You're On (Oksami Remix)": "/audio/03.mp3",
  "LIONE - Adore": "/audio/04.mp3",
  "PVRIS X Aleksei & Lophiile - Mind Over Matter SMMR'16": "/audio/05.mp3",
  "Lights - Slow Down (WRLD Remix)": "/audio/06.mp3",
  "KUMA - Falling For Somebody New": "/audio/07.mp3",
  "BTS - Seesaw (Moke Remix)": "/audio/08.mp3",
  "Zella Day - Compass (Louis the Child Remix)": "/audio/09.mp3",
  "HYUKOH - Gold (Chet Faker Remix)": "/audio/10.mp3",
  "Dream Perfect Regime (DPR) - EUNG FREESTYLE (응프리스타일) - LIVE, SIK-K, PUNCHNELLO, OWEN OVADOZ, FLOWSIK":
    "/audio/11.mp3",
  "Nero - The Thrill (Porter Robinson Remix)": "/audio/17.mp3",
  "Manila Killa - Everyday, Everyday (feat. Nevve)": "/audio/12.mp3",
  "Polyphia (feat. Sophia Black) - ABC": "/audio/13.mp3",
  "Manu Lei - Take My Hand feat. Noctilucent & Tiffany Wiemken (Suave Remix)": "/audio/16.mp3",
  "RL Grime - Halloween VIII": "/audio/14.mp3",
  "Medasin - IRENE 0.5": "/audio/15.mp3",
  "Josh Pan - Holy Ship 9.0 - DJing on Acid": "/audio/18.mp3",
  "Manila Killa - Hard Summer Set": "/audio/19.mp3",
  "Yetep - Solo (November Mix)": "/audio/20.mp3",
};

const Scene = () => {
  const { songUrl } = useControls({
    "Audio Controls": folder({
      songUrl: {
        value: "/audio/20.mp3",
        options: SONG_OPTIONS,
      },
      "Play/Pause": button(() => audioPlayer.pausePlayAudio()),
    }),
  });

  // Init FFTTexture
  const { audioData, audioPlayer } = useFFTTexture(songUrl, { fftSize: 4096 });

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

  const onClick = () => {
    if (audioPlayer.audioLoaded) {
      audioPlayer.initAudioPlayer();
      setStreamStarted(true);
      setHovered(false);
    }
  };

  useEffect(() => {
    if (hovered && audioPlayer.audioLoaded) document.body.style.cursor = "pointer";
    return () => (document.body.style.cursor = "auto");
  }, [hovered, audioPlayer.audioLoaded]);

  useFrame(() => {
    const { textureData } = audioData;
    if (textureData) bufferMaterial.uniforms.uFFTTexture.value = textureData;

    textRef.current.material.color.lerp(new Color().set(hovered ? "red" : "white"), 0.1);
  });

  return (
    <>
      <Debug />

      <Background fluidTexture={velocity.texture} />
      <PingPongScene audioData={audioData} />

      <Text
        ref={textRef}
        fontSize={0.5}
        fontWeight={700}
        textAlign="center"
        onClick={onClick}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        visible={audioPlayer.audioLoaded && !streamStarted}>
        start audio
      </Text>
    </>
  );
};

export default Scene;
