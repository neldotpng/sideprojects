import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
// import * as THREE from "three";

import Debug from "@/global/Debug";
import useLiquidBuffer from "@/global/hooks/useLiquidBuffer/useLiquidBuffer";
import FBOPlane from "@/components/three/FBOPlane/FBOPlane";
// import pingPongVertexShader from "./shaders/pingPong/pingPongVertexShader.glsl?raw";
// import pingPongFragmentShader from "./shaders/pingPong/pingPongFragmentShader.glsl?raw";

import { useScrollStore, useMouseStore, usePingPongStore } from "@/global/Stores";
import useScroller from "@/global/hooks/useScroller";
import useMouse from "@/global/hooks/useMouse";
// import usePingPong from "@/global/hooks/usePingPong";

const ScrollingScene = ({ scrollerRef, lenisRef }) => {
  const bufferScene = useLiquidBuffer();
  const scrollDataRef = useScroller(scrollerRef);
  const mouseDataRef = useMouse();

  // Init Uniforms for PingPong Buffer
  // const pingPongUniforms = useMemo(
  //   () => ({
  //     uMouse: {
  //       value: new THREE.Vector2(0, 0),
  //     },
  //     uMouseVelocity: {
  //       value: new THREE.Vector2(0, 0),
  //     },
  //   }),
  //   []
  // );
  // const [pingPongTextureRef, pingPongMaterial] = usePingPong({
  //   vertexShader: pingPongVertexShader,
  //   fragmentShader: pingPongFragmentShader,
  //   uniforms: pingPongUniforms,
  // });

  // Used to initiate Lenis rAF
  const { lenis } = useScrollStore();
  // const { mouseData } = useMouseStore();
  // const { pingPongTexture } = usePingPongStore();

  // Init ScrollStore
  useEffect(() => {
    useScrollStore.setState({ scrollData: scrollDataRef, lenis: lenisRef });
  }, [scrollDataRef, lenisRef]);

  // Init MouseStore
  useEffect(() => {
    useMouseStore.setState({ mouseData: mouseDataRef });
  }, [mouseDataRef]);

  // Init PingPongStore
  // useEffect(() => {
  //   usePingPongStore.setState({ pingPongTexture: pingPongTextureRef });
  // }, [pingPongTextureRef]);

  useFrame((state, dt) => {
    if (!lenis.current) return;

    // Initiate Lenis rAF in R3F
    const timeInMs = state.clock.getElapsedTime() * 1000;
    lenis.current.raf(timeInMs);

    // // Send Mouse values to PingPong Material
    // const { position, velocity } = mouseData.current;
    // pingPongMaterial.uniforms.uMouse.value.set(position.x, position.y);
    // pingPongMaterial.uniforms.uMouseVelocity.value.lerp(velocity, 1 - Math.pow(0.0125, dt));
  });

  return (
    <>
      <Debug />

      <FBOPlane
        segments={50}
        texture={bufferScene.texture}
        // pingPongTextureRef={pingPongTexture}
      />
    </>
  );
};

export default ScrollingScene;
