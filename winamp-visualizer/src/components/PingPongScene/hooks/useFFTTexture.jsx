import { useState, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const useFFTTexture = (fileUrl, fftSize = 1024) => {
  const [init, setInit] = useState(false);
  const [textureData, setTextureData] = useState();

  const audioRef = useRef();
  const analyzerRef = useRef();
  const listenerRef = useRef(new THREE.AudioListener());

  useEffect(() => {
    if (!init) return;

    const loader = new THREE.AudioLoader();
    loader.load(fileUrl, (buffer) => {
      audio.setBuffer(buffer);
      audio.setLoop(true);
      audio.play();
    });

    const audio = new THREE.Audio(listenerRef.current);

    const analyzer = new THREE.AudioAnalyser(audio, fftSize);
    analyzerRef.current = analyzer;
    audioRef.current = audio;

    setTextureData(
      new THREE.DataTexture(analyzerRef.current.data, fftSize / 2, 1, THREE.RedFormat)
    );
  }, [init, fileUrl, fftSize]);

  const startAudio = () => {
    if (!init) setInit(true);
  };

  useFrame(() => {
    if (!analyzerRef.current) return;

    analyzerRef.current.getFrequencyData();
    textureData.needsUpdate = true;
  });

  return [textureData, startAudio];
};

export default useFFTTexture;
