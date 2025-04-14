import { useEffect, useRef, useState } from "react";
import { useThree, useFrame } from "@react-three/fiber";

import vertexShader from "./shaders/vertexShader.glsl?raw";
import fragmentShader from "./shaders/fragmentShader.glsl?raw";

import usePingPong from "./hooks/usePingPong";
import useFFTTexture from "./hooks/useFFTTexture";

const PingPongScene = ({ segments = 2 }) => {
  const songs = ["/audio/00.mp3", "/audio/01.mp3", "/audio/02.mp3", "/audio/03.mp3"];
  const [song] = useState(songs[Math.floor(Math.random() * songs.length)]);

  const { viewport } = useThree();
  const plane = useRef();
  const [texture, bufferMaterial] = usePingPong(vertexShader, fragmentShader);
  const [dataTexture, startAudio] = useFFTTexture(song, 1024);

  // Scale Plane to Fullscreen
  useEffect(() => {
    plane.current.scale.x = viewport.width;
    plane.current.scale.y = viewport.height;
  }, [viewport]);

  const onClick = () => {
    startAudio();
  };

  useFrame(() => {
    bufferMaterial.uniforms.uTextureB.value = dataTexture;
  });

  return (
    <mesh
      ref={plane}
      onClick={onClick}>
      <planeGeometry args={[1, 1, segments, segments]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
};

export default PingPongScene;
