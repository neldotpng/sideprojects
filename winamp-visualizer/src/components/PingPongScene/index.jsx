import { useEffect, useRef, useState } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";

import bufferVertexShader from "./shaders/pingpong/vertexShader.glsl?raw";
import bufferFragmentShader from "./shaders/pingpong/fragmentShader.glsl?raw";
import vertexShader from "./shaders/vertexShader.glsl?raw";
import fragmentShader from "./shaders/fragmentShader.glsl?raw";

import usePingPong from "./hooks/usePingPong";
import useFFTTexture from "./hooks/useFFTTexture";

function getFrequencyAverage(data, start, end) {
  let sum = 0;
  const len = end - start;

  for (let i = start; i < end; i++) {
    sum += data[i];
  }

  return sum / len / 255;
}

const PingPongScene = ({ segments = 2 }) => {
  const songs = [
    "/audio/00.mp3",
    "/audio/01.mp3",
    "/audio/02.mp3",
    "/audio/03.mp3",
    "/audio/04.mp3",
    "/audio/05.mp3",
    "/audio/06.mp3",
    "/audio/07.mp3",
    "/audio/08.mp3",
  ];
  const [song] = useState(songs[Math.floor(Math.random() * songs.length)]);

  const { viewport } = useThree();
  const plane = useRef();
  const shaderMaterial = useRef();

  const bufferUniforms = {
    uFFTTexture: { value: null },
  };
  const uniforms = {
    uTexture: { value: null },
    uBass: { value: 0 },
    uMids: { value: 0 },
    uHighs: { value: 0 },
  };
  const fftSize = 1024;
  const [texture, bufferMaterial] = usePingPong(
    bufferVertexShader,
    bufferFragmentShader,
    bufferUniforms
  );
  const [dataTexture, sampleRate, setAudioPlay] = useFFTTexture(song, fftSize);
  const [binInfo, setBinInfo] = useState({
    bassRange: [0, 0],
    midsRange: [0, 0],
    highsRange: [0, 0],
  });

  // Scale Plane to Fullscreen
  useEffect(() => {
    plane.current.scale.x = viewport.width;
    plane.current.scale.y = viewport.height;
  }, [viewport]);

  const onClick = () => {
    setAudioPlay();
  };

  useEffect(() => {
    const binWidth = sampleRate / fftSize;
    const bassRange = [Math.floor(20 / binWidth), Math.floor(250 / binWidth)];
    const midsRange = [Math.floor(250 / binWidth), Math.floor(2000 / binWidth)];
    const highsRange = [Math.floor(2000 / binWidth), Math.floor(20000 / binWidth)];

    setBinInfo({
      bassRange,
      midsRange,
      highsRange,
    });
  }, [sampleRate]);

  useFrame(() => {
    if (dataTexture && texture) {
      bufferMaterial.uniforms.uFFTTexture.value = dataTexture;

      // shaderMaterial.current.uniforms.uTexture.value = texture;
      // shaderMaterial.current.uniforms.uBass.value = getFrequencyAverage(
      //   dataTexture.image.data,
      //   binInfo.bassRange[0],
      //   binInfo.bassRange[1]
      // );
      // shaderMaterial.current.uniforms.uMids.value = getFrequencyAverage(
      //   dataTexture.image.data,
      //   binInfo.midsRange[0],
      //   binInfo.midsRange[1]
      // );
      // shaderMaterial.current.uniforms.uHighs.value = getFrequencyAverage(
      //   dataTexture.image.data,
      //   binInfo.highsRange[0],
      //   binInfo.highsRange[1]
      // );
    }
  });

  return (
    <mesh
      ref={plane}
      onClick={onClick}>
      <planeGeometry args={[1, 1, segments, segments]} />
      {/* <shaderMaterial
        ref={shaderMaterial}
        uniforms={uniforms}
        side={THREE.DoubleSide}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      /> */}
      <meshBasicMaterial map={texture} />
    </mesh>
  );
};

export default PingPongScene;
