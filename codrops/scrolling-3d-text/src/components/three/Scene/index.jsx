import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

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

// const test = ["test"];

const Scene = ({ scroller }) => {
  const scrollData = useScroller(scroller);
  const groupHeight = useRef(1.5 * words.length);
  const group = useRef();

  useFrame(() => {
    group.current.position.y = groupHeight.current * scrollData.current.progress;
  });

  return (
    <>
      <Debug />

      {/* <ambientLight intensity={0.1} />
      <directionalLight
        color="red"
        position={[0, 0, 5]}
      /> */}

      <group
        ref={group}
        position={[0, 0, 0]}>
        {words.map((word, index) => (
          <ScrollingText
            key={index}
            groupHeight={groupHeight.current}
            scrollData={scrollData}
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
