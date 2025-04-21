import { useState, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useControls, folder, button, buttonGroup } from "leva";

const useFFTTexture = (files, fftSize = 1024) => {
  // Song Selection via Leva
  const [songIndex, setSongIndex] = useState(0);
  // Array of audio files uploaded
  const [songs, setSongs] = useState(files);
  // Generated file URLs for loading via AudioLoader
  const [song, setSong] = useState("");
  // Used to dispose of old file URLs
  const prevSong = useRef();
  // Variable for tracking time for -10s/+10s Leva Controls
  const timeDiff = useRef(0);
  // Playback speed variable for Leva
  const [speed, setSpeed] = useState(1);

  // Return values
  const [textureData, setTextureData] = useState();
  const [sampleRate, setSampleRate] = useState(0);

  // Effects management
  const [audioLoaded, setAudioLoaded] = useState(false);

  // THREE Audio Constants
  const listener = useRef(new THREE.AudioListener());
  const audio = useRef(new THREE.Audio(listener.current));
  const analyzer = useRef(new THREE.AudioAnalyser(audio.current, fftSize));
  const loader = useRef(new THREE.AudioLoader());

  // Leva Controls
  useControls(
    () => ({
      "Audio Controls": folder(
        {
          "Loop Song": {
            value: false,
            onChange: (val) => {
              audio.current.setLoop(val);
            },
          },
          "Song Index": {
            value: 0,
            min: 0,
            max: songs.length > 0 ? songs.length - 1 : 0,
            step: 1,
          },
          Speed: {
            value: speed,
            min: 0.1,
            max: 2,
            step: 0.1,
          },
          "Start Time": {
            value: { min: 0, sec: 0 },
            min: 0,
            max: 59,
            step: 1,
          },
          Playback: buttonGroup({
            "-10s": () => {
              timeDiff.current -= 10;
              const offset = audio.current.context.currentTime + timeDiff.current;
              seekAudio(offset);
            },
            "Play/Pause": () => pausePlayAudio(),
            "+10s": () => {
              timeDiff.current += 10;
              const offset = audio.current.context.currentTime + timeDiff.current;
              seekAudio(offset);
            },
          }),
          "Update and Restart": button((get) => {
            const pr = get("Audio Controls.Speed");
            const si = get("Audio Controls.Song Index");
            const st = get("Audio Controls.Start Time");
            const ct = st.min * 60 + st.sec;

            if (ct > audio.current?.buffer?.duration) {
              const t = Math.floor(audio.current.buffer.duration);
              const mins = Math.round((t / 60) * 100) / 100;
              const secs = Math.floor((mins - Math.floor(mins)) * 60);

              window.alert(
                `"Start Time" exceeded max duration of the audio file. 
                Reduce value below: ${Math.floor(mins)}m ${secs}s`
              );
            } else {
              timeDiff.current = ct - audio.current.context.currentTime;
              audio.current.offset = ct;
              audio.current.stop();
              audio.current.play();
            }

            setSpeed(pr);
            setSongIndex(si);
          }),
        },
        { collapsed: true }
      ),
    }),
    [songs]
  );

  // Seek playback
  const seekAudio = (offsetInSeconds) => {
    if (!audio.current.buffer) return;

    const duration = audio.current.buffer.duration;
    const clampedOffset = Math.max(0, Math.min(offsetInSeconds, duration));

    audio.current.offset = clampedOffset;

    // Stop current playback and play from the new offset
    audio.current.stop();
    audio.current.play(0);
  };

  // Control playback from leva controls
  const pausePlayAudio = () => {
    audio.current.isPlaying ? audio.current.pause() : audio.current.play();
  };

  // Function to call when song ends
  const playNextSong = () => {
    if (songIndex + 1 < songs.length) {
      setSongIndex(songIndex + 1);
    } else {
      setSongIndex(0);
    }
  };
  // Set onEnded function for audio once on load
  audio.current.onEnded = playNextSong;

  // Update Playback Rate
  useEffect(() => {
    audio.current.setPlaybackRate(speed);
  }, [speed]);

  // Update Song After File Upload
  useEffect(() => {
    setSongs(files);
  }, [files]);

  // Create url for AudioLoader based on songs array and songIndex
  useEffect(() => {
    if (songs[songIndex]) {
      // Revoke last song URL, prevents doubles when audio is restarted
      URL.revokeObjectURL(prevSong.current);

      // Create new song URL
      const url = URL.createObjectURL(songs[songIndex]);

      setSong(url);
    }
  }, [songs, songIndex]);

  // Hook to Load New Song
  useEffect(() => {
    // If no song detected, return
    if (song === "") return;

    prevSong.current = song;

    // Set the sampleRate for the song, used for analysis
    setSampleRate(listener.current.context.sampleRate);

    // Stop current audio when new audio is being loaded
    if (audio.current.isPlaying) audio.current.stop();

    loader.current.load(
      song,
      (buffer) => {
        audio.current.setBuffer(buffer);
        audio.current.play();

        timeDiff.current = -audio.current.context.currentTime;
        setAudioLoaded(true);
      }
      // (progress) => {
      //   console.log((progress.loaded / progress.total) * 100);
      // }
    );
  }, [song]);

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

  return [textureData, sampleRate];
};

export default useFFTTexture;
