import { useEffect, useRef, useState, useMemo, useLayoutEffect } from "react";
import { useThree, useFrame, extend } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";

import bufferFunctions from "./shaders/includes/functions.glsl?raw";
import bufferVertexShader from "./shaders/pingpong/vertexShader.glsl?raw";
import bufferFragmentShader from "./shaders/pingpong/fragmentShader.glsl?raw";
import vertexShader from "./shaders/vertexShader.glsl?raw";
import fragmentShader from "./shaders/fragmentShader.glsl?raw";

import usePingPong from "./hooks/usePingPong";
import useFFTTexture from "./hooks/useFFTTexture";
import useShaderControls from "./hooks/useShaderControls";

// Calculate average strength of fq in range [start, end]
function getFrequencyAverage(data, start, end) {
  let sum = 0;
  const len = end - start;

  for (let i = start; i < end; i++) {
    sum += data[i];
  }

  return sum / len / 255;
}

// Uniforms for customShaderMaterial
const uniforms = {
  uTime: 0,
  uAspect: 0,
  uTexture: null,
  uFFTTexture: null,
  uBass: 0,
  uMids: 0,
  uHighs: 0,
  uEnergy: 0,
  uPreset: 0,
  uPCGC1: new THREE.Vector3(),
  uPCGC2: new THREE.Vector3(),
  uPCGC3: new THREE.Vector3(),
  uPCGC4: new THREE.Vector3(),
};

// Initiate Drei shaderMaterial
const CustomShaderMaterial = shaderMaterial(uniforms, vertexShader, fragmentShader);
extend({ CustomShaderMaterial });

const PingPongScene = ({ files = [], segments = 2 }) => {
  // Used for resizing the plane to fullscreen aspect ratio
  const { viewport } = useThree();

  const plane = useRef();
  const shaderMaterial = useRef();

  // Uniforms for the PingPong bufferMaterial
  const bufferUniforms = useMemo(() => {
    return {
      uFFTTexture: { value: null },
      uAspect: { value: 0 },
      uBass: { value: 0 },
      uMids: { value: 0 },
      uHighs: { value: 0 },
      uEnergy: { value: 0 },
      uPreset: { value: 0 },
      uTimeStrength: { value: 0.1 },
      uFadeStrength: { value: 0.1 },
      uTrailStrength: { value: 0.1 },
      uRSGC1: { value: new THREE.Vector3() },
      uRSGC2: { value: new THREE.Vector3() },
      uRSGC3: { value: new THREE.Vector3() },
      uRSGC4: { value: new THREE.Vector3() },
      uRSGC5: { value: new THREE.Vector3() },
      uRSGC6: { value: new THREE.Vector3() },
      uRSGC7: { value: new THREE.Vector3() },
      uRSGC8: { value: new THREE.Vector3() },
      uSCGC1: { value: new THREE.Vector3() },
      uSCGC2: { value: new THREE.Vector3() },
      uSCGC3: { value: new THREE.Vector3() },
      uSCGC4: { value: new THREE.Vector3() },
      uMGC1: { value: new THREE.Vector3() },
      uMGC2: { value: new THREE.Vector3() },
      uMGC3: { value: new THREE.Vector3() },
      uMGC4: { value: new THREE.Vector3() },
    };
  }, []);

  // Values higher than 1024 are not working...
  const fftSize = useMemo(() => 1024, []);

  // Initiate PingPong Hook
  const [texture, bufferMaterial] = usePingPong({
    vertexShader: bufferVertexShader,
    // Concat functions.glsl and bufferFragmentShader.glsl
    fragmentShader: `${bufferFunctions} ${bufferFragmentShader}`,
    uniforms: bufferUniforms,
  });

  // Initiate FFTTexture Analysis Hook
  const [dataTexture, sampleRate] = useFFTTexture(files, fftSize);

  // Stateful bass/mids/highs sampling range for averaging and passing uniforms
  const [binInfo, setBinInfo] = useState({
    bassRange: [0, 0],
    midsRange: [0, 0],
    highsRange: [0, 0],
  });

  // Shader Controls
  useShaderControls({
    getMaterials: () => {
      return { shaderMaterial: shaderMaterial.current, bufferMaterial: bufferMaterial };
    },
  });

  // Scale Plane to Fullscreen
  useLayoutEffect(() => {
    plane.current.scale.x = viewport.width;
    plane.current.scale.y = viewport.height;
    bufferMaterial.uniforms.uAspect.value = viewport.width / viewport.height;
  }, [viewport, bufferMaterial]);

  // Update the binInfo based on sampleRate and fftSize
  useEffect(() => {
    const binWidth = sampleRate / fftSize;
    const midsRange = [Math.floor(250 / binWidth), Math.floor(2000 / binWidth)];
    const bassRange = [Math.floor(20 / binWidth), midsRange[0]];
    const highsRange = [midsRange[1], Math.floor(20000 / binWidth)];

    setBinInfo({
      bassRange,
      midsRange,
      highsRange,
    });
  }, [sampleRate, fftSize]);

  useFrame((state, delta) => {
    if (dataTexture && texture) {
      // Calculate average frequency for fftTextures in bass/mid/high ranges
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

      // Uniform updates for bufferMaterial
      bufferMaterial.uniforms.uFFTTexture.value = dataTexture;
      bufferMaterial.uniforms.uBass.value = bass;
      bufferMaterial.uniforms.uMids.value = mids;
      bufferMaterial.uniforms.uHighs.value = highs;
      bufferMaterial.uniforms.uEnergy.value = energy;

      // Uniforms for customShaderMaterial
      shaderMaterial.current.uniforms.uTime.value += delta;
      shaderMaterial.current.uniforms.uTexture.value = texture;
      shaderMaterial.current.uniforms.uBass.value = bass;
      shaderMaterial.current.uniforms.uMids.value = mids;
      shaderMaterial.current.uniforms.uHighs.value = highs;
      shaderMaterial.current.uniforms.uEnergy.value = energy;
    }
  });

  return (
    <mesh ref={plane}>
      <planeGeometry args={[1, 1, segments, segments]} />
      <customShaderMaterial
        ref={shaderMaterial}
        key={CustomShaderMaterial.key}
      />
    </mesh>
  );
};

export default PingPongScene;
