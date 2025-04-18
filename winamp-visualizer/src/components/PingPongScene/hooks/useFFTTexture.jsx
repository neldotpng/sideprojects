import { useState, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useControls, folder, button } from "leva";

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
  "/audio/14.mp3",
  "/audio/15.mp3",
  // "/audio/16.mp3",
];

const songIndex = Math.floor(Math.random() * songs.length);

const useFFTTexture = ({ fftSize = 1024 }) => {
  const [song, setSong] = useState(songs[songIndex]);
  const [playbackRate, setPlaybackRate] = useState(1);

  // Return values
  const [textureData, setTextureData] = useState();
  const [sampleRate, setSampleRate] = useState(0);

  // Effects management
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [playable, setPlayable] = useState(false);

  // THREE Audio Constants
  const listener = useRef(new THREE.AudioListener());
  const audio = useRef(new THREE.Audio(listener.current));
  const analyzer = useRef(new THREE.AudioAnalyser(audio.current, fftSize));
  const loader = useRef(new THREE.AudioLoader());

  // Leva Controls
  const [Audio] = useControls(() => ({
    Audio: folder(
      {
        "Playback Rate": {
          value: playbackRate,
          min: 0.1,
          max: 2,
          step: 0.1,
        },
        Song: {
          value: songIndex,
          min: 0,
          max: songs.length - 1,
          step: 1,
        },
        "Start Time": {
          value: { min: 0, sec: 0 },
          min: 0,
          max: 60,
          step: 1,
        },
        "Update Settings": button((get) => {
          const i = get("Audio.Song");
          const pr = get("Audio.Playback Rate");

          const st = get("Audio.Start Time");
          const ct = st.min * 60 + st.sec;

          if (ct > audio.current?.buffer?.duration) {
            const t = Math.floor(audio.current.buffer.duration);
            const mins = Math.round((t / 60) * 100) / 100;
            const secs = Math.floor((mins - Math.floor(mins)) * 60);

            console.warn(
              `"Start Time" exceeded max duration of the audio file. 
                Reduce value below: ${Math.floor(mins)}m ${secs}s`
            );
          } else {
            audio.current.offset = ct;
          }

          setPlaybackRate(pr);
          setSong(songs[i]);
        }),
        "Play/Pause Audio": button(() => {
          pausePlayAudio();
        }),
        "Restart Audio": button(() => {
          audio.current.stop();
          audio.current.play();
        }),
      },
      {
        collapsed: true,
      }
    ),
  }));

  useEffect(() => {
    audio.current.setPlaybackRate(playbackRate);
  }, [playbackRate]);

  // Hook to Load New Song
  useEffect(() => {
    if (!playable) return;

    setSampleRate(listener.current.context.sampleRate);

    audio.current.stop();

    loader.current.load(song, (buffer) => {
      audio.current.setBuffer(buffer);
      audio.current.setLoop(true);
      audio.current.play();

      setAudioLoaded(true);
    });
  }, [song, playable]);

  // Update FFT Texture Data after audio loads
  useEffect(() => {
    if (!audioLoaded) return;

    setTextureData(new THREE.DataTexture(analyzer.current.data, fftSize / 2, 1, THREE.RedFormat));
  }, [fftSize, audioLoaded]);

  useFrame(() => {
    if (!audioLoaded) return;

    analyzer.current.getFrequencyData();
    textureData.needsUpdate = true;
  });

  // Needed for user interaction to initiate audio
  const setAudioPlayable = () => {
    setPlayable(true);
  };

  // Control playback from leva controls
  const pausePlayAudio = () => {
    audio.current.isPlaying ? audio.current.pause() : audio.current.play();
  };

  return [textureData, sampleRate, setAudioPlayable];
};

export default useFFTTexture;
