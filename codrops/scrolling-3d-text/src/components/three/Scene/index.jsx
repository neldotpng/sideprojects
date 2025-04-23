import Debug from "@/global/Debug";
import ScrollingText from "@/components/three/ScrollingText";
import useScroller from "@/global/hooks/useScroller";
import { useEffect } from "react";

const Scene = ({ scroller }) => {
  const scrollData = useScroller(scroller);

  useEffect(() => {}, [scrollData]);

  return (
    <>
      <Debug />

      <ambientLight intensity={0.1} />
      <directionalLight
        color="red"
        position={[0, 0, 5]}
      />

      <ScrollingText>Hello World!</ScrollingText>
      <ScrollingText>Goodbye World!</ScrollingText>
    </>
  );
};

export default Scene;
