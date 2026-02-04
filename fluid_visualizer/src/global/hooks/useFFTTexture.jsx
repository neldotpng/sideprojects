import { useState, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// THREE Audio Constants
const listener = new THREE.AudioListener();
const audio = new THREE.Audio(listener);
const loader = new THREE.AudioLoader();

const useFFTTexture = (song, fftSize = 1024) => {
  // THREE AudioAnalyzer
  const analyzer = useRef(new THREE.AudioAnalyser(audio, fftSize));

  // Return values
  const [textureData, setTextureData] = useState();
  const [sampleRate, setSampleRate] = useState(0);

  // Effects management
  const [audioLoaded, setAudioLoaded] = useState(false);

  // Hook to Load New Song
  useEffect(() => {
    // Set the sampleRate for the song, used for analysis
    setSampleRate(listener.context.sampleRate);

    // Stop current audio when new audio is being loaded
    if (audio.isPlaying) audio.stop();

    loader.load(song, (buffer) => {
      audio.setBuffer(buffer);
      if (!audio.isPlaying) audio.play();

      setAudioLoaded(true);
      setTextureData(new THREE.DataTexture(analyzer.current.data, fftSize / 2, 1, THREE.RedFormat));
    });
  }, [song, fftSize]);

  useFrame(() => {
    if (!audioLoaded) return;

    analyzer.current.getFrequencyData();
    textureData.needsUpdate = true;
  });

  return { textureData, sampleRate };
};

export default useFFTTexture;
