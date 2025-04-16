import { useEffect, useRef, useState, useMemo } from "react";
import { useThree, useFrame, extend } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";

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

const uniforms = {
  uTime: 0,
  uAspect: 0,
  uTexture: null,
  uFFTTexture: null,
  uBass: 0,
  uMids: 0,
  uHighs: 0,
  uEnergy: 0,
};

const CustomShaderMaterial = shaderMaterial(uniforms, vertexShader, fragmentShader);

extend({ CustomShaderMaterial });

const PingPongScene = ({ segments = 50 }) => {
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
    "/audio/09.mp3",
    "/audio/10.mp3",
    "/audio/11.mp3",
    "/audio/12.mp3",
    "/audio/13.mp3",
  ];
  // const [song] = useState(songs[Math.floor(Math.random() * songs.length)]);
  const [song] = useState(songs[4]);

  const { viewport } = useThree();
  const plane = useRef();
  const shaderMaterial = useRef();

  const bufferUniforms = useMemo(() => {
    return {
      uFFTTexture: { value: null },
      uBass: { value: 0 },
      uMids: { value: 0 },
      uHighs: { value: 0 },
      uEnergy: { value: 0 },
      uAspect: { value: 0 },
    };
  }, []);

  const fftSize = useMemo(() => {
    return 1024;
  }, []);

  const [texture, bufferMaterial] = usePingPong({
    vertexShader: bufferVertexShader,
    fragmentShader: bufferFragmentShader,
    uniforms: bufferUniforms,
  });
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
    bufferMaterial.uniforms.uAspect.value = viewport.width / viewport.height;
  }, [viewport, bufferMaterial]);

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
  }, [sampleRate, fftSize]);

  useFrame((state, delta) => {
    if (dataTexture && texture) {
      bufferMaterial.uniforms.uFFTTexture.value = dataTexture;

      shaderMaterial.current.uniforms.uTime.value += delta;
      shaderMaterial.current.uniforms.uTexture.value = texture;

      const bass = getFrequencyAverage(
        dataTexture.image.data,
        binInfo.bassRange[0],
        binInfo.bassRange[1]
      );
      const mids = getFrequencyAverage(
        dataTexture.image.data,
        binInfo.midsRange[0],
        binInfo.midsRange[1]
      );
      const highs = getFrequencyAverage(
        dataTexture.image.data,
        binInfo.highsRange[0],
        binInfo.highsRange[1]
      );
      const energy = getFrequencyAverage(
        dataTexture.image.data,
        binInfo.bassRange[0],
        binInfo.highsRange[1]
      );

      shaderMaterial.current.uniforms.uBass.value = bass;
      shaderMaterial.current.uniforms.uMids.value = mids;
      shaderMaterial.current.uniforms.uHighs.value = highs;
      shaderMaterial.current.uniforms.uEnergy.value = energy;
      bufferMaterial.uniforms.uBass.value = bass;
      bufferMaterial.uniforms.uMids.value = mids;
      bufferMaterial.uniforms.uHighs.value = highs;
      bufferMaterial.uniforms.uEnergy.value = energy;
    }
  });

  return (
    <mesh
      ref={plane}
      onClick={onClick}>
      <planeGeometry args={[1, 1, segments, segments]} />
      <customShaderMaterial
        ref={shaderMaterial}
        key={CustomShaderMaterial.key}
      />
    </mesh>
  );
};

export default PingPongScene;
