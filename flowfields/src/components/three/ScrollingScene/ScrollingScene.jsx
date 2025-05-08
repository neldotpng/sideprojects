import { useEffect } from "react";
import { useFrame } from "@react-three/fiber";

import Debug from "@/global/Debug";
import Particles from "@/components/three/Particles/Particles";
import FullScreenShaderPlane from "@/templates/components/FullScreenShaderPlane";

import { useScrollStore, useMouseStore } from "@/global/Stores";
import useScroller from "@/global/hooks/useScroller";
import useMouse from "@/global/hooks/useMouse";

const ScrollingScene = ({ scrollerRef, lenisRef }) => {
  const scrollDataRef = useScroller(scrollerRef);
  const mouseDataRef = useMouse();

  // Used to initiate Lenis rAF
  const { lenis } = useScrollStore();

  // Init ScrollStore
  useEffect(() => {
    useScrollStore.setState({ scrollData: scrollDataRef, lenis: lenisRef });
  }, [scrollDataRef, lenisRef]);

  // Init MouseStore
  useEffect(() => {
    useMouseStore.setState({ mouseData: mouseDataRef });
  }, [mouseDataRef]);

  useFrame((state) => {
    if (!lenis.current) return;

    // Initiate Lenis rAF in R3F
    const timeInMs = state.clock.getElapsedTime() * 1000;
    lenis.current.raf(timeInMs);
  });

  return (
    <>
      <Debug />

      <Particles count={1000000} />

      {/* <FullScreenShaderPlane /> */}
    </>
  );
};

export default ScrollingScene;
