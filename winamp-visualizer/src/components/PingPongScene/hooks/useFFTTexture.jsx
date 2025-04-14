import { useState, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const useFFTTexture = (fileUrl, fftSize = 1024) => {
  const [textureData, setTextureData] = useState();
  const [sampleRate, setSampleRate] = useState(0);
  const [playing, setPlaying] = useState(false);

  const audioRef = useRef();
  const analyzerRef = useRef();

  useEffect(() => {
    if (!playing) return;

    const listener = new THREE.AudioListener();
    setSampleRate(listener.context.sampleRate);

    const loader = new THREE.AudioLoader();
    const audio = new THREE.Audio(listener);

    loader.load(fileUrl, (buffer) => {
      audio.setBuffer(buffer);
      audio.setLoop(true);
      audio.play();
    });

    const analyzer = new THREE.AudioAnalyser(audio, fftSize);
    analyzerRef.current = analyzer;
    audioRef.current = audio;

    setTextureData(
      new THREE.DataTexture(analyzerRef.current.data, fftSize / 2, 1, THREE.RedFormat)
    );
  }, [fileUrl, fftSize, playing]);

  useFrame(() => {
    if (!analyzerRef.current) return;

    analyzerRef.current.getFrequencyData();
    textureData.needsUpdate = true;
  });

  const setAudioPlaying = () => {
    setPlaying(true);
  };

  return [textureData, sampleRate, setAudioPlaying];
};

export default useFFTTexture;
