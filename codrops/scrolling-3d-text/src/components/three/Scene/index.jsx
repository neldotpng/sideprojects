import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";

import { useScrollStore } from "@/global/Store";
import Debug from "@/global/Debug";
import ScrollingText from "@/components/three/ScrollingText";
import useScroller from "@/global/hooks/useScroller";

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

const Scene = ({ scroller, lenis: lenisRef }) => {
  const scrollDataRef = useScroller(scroller);
  const { scrollData, lenis } = useScrollStore();

  const groupHeight = useRef(1.5 * words.length);
  const group = useRef();

  useEffect(() => {
    useScrollStore.setState({ scrollData: scrollDataRef, lenis: lenisRef });
  }, [scrollDataRef, lenisRef]);

  useFrame((state) => {
    if (!lenis.current && !scrollData.current) return;

    // Initiate Lenis rAF in R3F
    const timeInMs = state.clock.getElapsedTime() * 1000;
    lenis.current.raf(timeInMs);

    group.current.position.y = groupHeight.current * scrollData.current.progress;
  });

  return (
    <>
      <Debug />

      <group
        ref={group}
        position={[0, 0, 0]}>
        {words.map((word, index) => (
          <ScrollingText
            key={index}
            groupHeight={groupHeight.current}
            position={[-3, index * -1.5, 0]}
            fontSize={1}>
            {word[0].toUpperCase() + word.slice(1)}
          </ScrollingText>
        ))}
      </group>
    </>
  );
};

export default Scene;
