import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";

import { useScrollStore } from "@/global/Store";
import Debug from "@/global/Debug";
import ScrollingText from "@/components/three/ScrollingText/ScrollingText";
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

const Scene = ({ scrollerRef, lenisRef }) => {
  const scrollDataRef = useScroller(scrollerRef);
  const { scrollData, lenis } = useScrollStore();

  const spacing = useRef(1.5);
  const groupHeight = useRef(spacing.current * words.length);
  const group = useRef();

  useEffect(() => {
    useScrollStore.setState({ scrollData: scrollDataRef, lenis: lenisRef });
  }, [scrollDataRef, lenisRef]);

  useFrame((state) => {
    if (!lenis.current && !scrollData.current) return;

    // Initiate Lenis rAF in R3F
    const timeInMs = state.clock.getElapsedTime() * 1000;
    lenis.current.raf(timeInMs);

    // console.log(scrollData.current.sectionProgress);

    group.current.position.y = groupHeight.current * scrollData.current.sectionProgress;
  });

  return (
    <>
      <Debug />

      <group
        ref={group}
        position={[0, 0, 0]}>
        {[words[words.length - 1], words[words.length - 2]].map((word, index) => (
          <ScrollingText
            key={index}
            groupHeight={groupHeight.current}
            position={[-3.75, index * spacing.current + spacing.current, 0]}
            fontWeight={900}>
            {word.toUpperCase()}
          </ScrollingText>
        ))}
        {words.map((word, index) => (
          <ScrollingText
            key={index}
            groupHeight={groupHeight.current}
            position={[-3.75, index * -spacing.current, 0]}
            fontWeight={900}>
            {word.toUpperCase()}
          </ScrollingText>
        ))}
        {words.slice(0, 3).map((word, index) => (
          <ScrollingText
            key={index}
            groupHeight={groupHeight.current}
            position={[
              -3.75,
              index * -spacing.current - (words.length - 1) * spacing.current - spacing.current,
              0,
            ]}
            fontWeight={900}>
            {word.toUpperCase()}
          </ScrollingText>
        ))}
      </group>
    </>
  );
};

export default Scene;
