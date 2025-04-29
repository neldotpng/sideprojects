import { useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { useScrollStore, useMouseStore, usePingPongStore } from "@/global/Store";
import usePingPong from "@/global/hooks/usePingPong";

import pingPongVertexShader from "./shaders/pingPong/vertexShader.glsl?raw";
import pingPongFragmentShader from "./shaders/pingPong/fragmentShader.glsl?raw";

import Debug from "@/global/Debug";
import TextList from "@/components/three/TextList/TextList";
import useScroller from "@/global/hooks/useScroller";
import useMouse from "@/global/hooks/useMouse";

const words = [
  "serendipity",
  "ephemeral",
  "luminous",
  "mellifluous",
  "ethereal",
  "sonder",
  "euphoria",
  "gossamer",
  "labyrinthine",
  "halcyon",
  "lilt",
  "nefelibata",
  "elegy",
  "numinous",
  "petrichor",
  "sonorous",
  "reverie",
  "effervescent",
  "limerence",
  "tranquility",
  "aether",
  "eloquence",
  "zenith",
  "solace",
  "elixir",
  "silhouette",
  "mirage",
  "vestige",
  "irenic",
  "palimpsest",
];

const Scene = ({ scrollerRef, lenisRef }) => {
  const { viewport } = useThree();

  const scrollDataRef = useScroller(scrollerRef);
  const mouseDataRef = useMouse();

  const pingPongUniforms = useMemo(
    () => ({
      uMouse: {
        value: new THREE.Vector2(0, 0),
      },
      uMouseVelocity: {
        value: new THREE.Vector2(0, 0),
      },
    }),
    []
  );
  const [pingPongTextureRef, pingPongMaterial] = usePingPong({
    vertexShader: pingPongVertexShader,
    fragmentShader: pingPongFragmentShader,
    uniforms: pingPongUniforms,
  });

  // Used to initiate Lenis rAF
  const { lenis } = useScrollStore();
  const { mouseData } = useMouseStore();

  useEffect(() => {
    useScrollStore.setState({ scrollData: scrollDataRef, lenis: lenisRef });
  }, [scrollDataRef, lenisRef]);

  useEffect(() => {
    useMouseStore.setState({ mouseData: mouseDataRef });
  }, [mouseDataRef]);

  useEffect(() => {
    usePingPongStore.setState({ pingPongTexture: pingPongTextureRef });
  }, [pingPongTextureRef]);

  useFrame((state, dt) => {
    if (!lenis.current) return;

    // Initiate Lenis rAF in R3F
    const timeInMs = state.clock.getElapsedTime() * 1000;
    lenis.current.raf(timeInMs);

    const { position, velocity } = mouseData.current;

    pingPongMaterial.uniforms.uMouse.value.set(position.x, position.y);
    // pingPongMaterial.uniforms.uMouseVelocity.value.set(velocity.x, velocity.y);
    pingPongMaterial.uniforms.uMouseVelocity.value.lerp(velocity, 1 - Math.pow(0.0125, dt));
  });

  return (
    <>
      <Debug />

      <TextList
        position={[0, 0, 0]}
        words={words}
        fontSize={viewport.width / 10}
      />
    </>
  );
};

export default Scene;
