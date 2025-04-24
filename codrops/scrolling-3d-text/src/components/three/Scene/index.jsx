import { ScrollControls, Scroll, Html } from "@react-three/drei";

import Debug from "@/global/Debug";
import ScrollingText from "@/components/three/ScrollingText";
import Scroller from "@/components/dom/Scroller";

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

const test = ["test"];

const Scene = () => {
  return (
    <ScrollControls
      pages={10}
      damping={0.1}>
      <Debug />

      <group position={[0, 0, 0]}>
        {test.map((word, index) => (
          <ScrollingText
            key={index}
            position={[-3, index * -1.5, 0]}
            fontSize={1}>
            {word[0].toUpperCase() + word.slice(1)}
          </ScrollingText>
        ))}
      </group>

      <Html>
        <Scroller sections={[500, 200, 300]} />
      </Html>
    </ScrollControls>
  );
};

export default Scene;
