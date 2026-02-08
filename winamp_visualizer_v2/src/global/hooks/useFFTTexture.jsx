import { useState, useRef, useEffect, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// THREE Audio Constants
const listener = new THREE.AudioListener();
const audio = new THREE.Audio(listener);
const loader = new THREE.AudioLoader();

// Calculate average strength of fq in range [start, end]
const getFrequencyAverage = (data, start, end) => {
  let sum = 0;
  const len = end - start;

  for (let i = start; i < end; i++) {
    sum += data[i];
  }

  return sum / len / 255;
};

const DEFAULT_OPTIONS = {
  fftSize: 1024,
  numBins: 8,
};

const useFFTTexture = (song, options = {}) => {
  const { fftSize = DEFAULT_OPTIONS.fftSize, numBins = DEFAULT_OPTIONS.numBins } = options;

  // THREE AudioAnalyzer
  const analyzer = useRef(new THREE.AudioAnalyser(audio, fftSize));

  // Return values
  const [textureData, setTextureData] = useState();
  const [sampleRate, setSampleRate] = useState(0);
  const binStrengths = useRef([]);

  // Effects management
  const [audioLoaded, setAudioLoaded] = useState(false);

  // Stateful bass/mids/highs sampling range for averaging and passing uniforms
  const [binInfo, setBinInfo] = useState([]);

  // Audio Player Controls
  // Initialize the audio player
  const initAudioPlayer = useCallback(() => {
    if (!audioLoaded) return;
    if (!audio.isPlaying) audio.play();
  }, [audioLoaded]);

  // Pause/Play the audio
  const pausePlayAudio = () => {
    if (audio.isPlaying) audio.pause();
    else audio.play();
  };

  // Hook to Load New Song
  useEffect(() => {
    // Set the sampleRate for the song, used for analysis
    setSampleRate(listener.context.sampleRate);

    // Stop current audio when new audio is being loaded
    if (audio.isPlaying) audio.stop();

    if (!song) return;

    loader.load(song, (buffer) => {
      audio.setBuffer(buffer);

      setAudioLoaded(true);
      setTextureData(new THREE.DataTexture(analyzer.current.data, fftSize / 2, 1, THREE.RedFormat));
    });
  }, [song, fftSize]);

  // Update the binInfo based on sampleRate and fftSize
  useEffect(() => {
    const binWidth = sampleRate / (fftSize / 2);

    const subBassHz = 20;
    const binRanges = [...Array(numBins)].map((_, i) => {
      const binStart = subBassHz * Math.pow(2, i);
      const binEnd = i === numBins - 1 ? 20000 : binStart * 2;
      return [Math.floor(binStart / binWidth), Math.floor(binEnd / binWidth)];
    });

    setBinInfo(binRanges);
  }, [sampleRate, fftSize, numBins]);

  useFrame(() => {
    if (!audioLoaded) return;

    // Calculate average strength of each bin
    const strengths = binInfo.map((bin) => {
      const strength = getFrequencyAverage(textureData.image.data, bin[0], bin[1]);
      return strength;
    });

    // Calculate average strength of all bins
    const totalStrengthAverage = getFrequencyAverage(
      textureData.image.data,
      binInfo[0][0],
      binInfo[binInfo.length - 1][1],
    );

    strengths.push(totalStrengthAverage);
    binStrengths.current = strengths;

    analyzer.current.getFrequencyData();
    textureData.needsUpdate = true;
  });

  return {
    audioData: { textureData, binStrengths, sampleRate },
    audioPlayer: { audioLoaded, initAudioPlayer, pausePlayAudio },
  };
};

export default useFFTTexture;
