import { useRef, useCallback, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";

import ScrollingText from "@/components/three/ScrollingText/ScrollingText";
import { useScrollStore } from "@/global/Store";

const TextList = ({ position = [0, 0, 0], words = ["Test"], fontSize = 1 }) => {
  const { viewport } = useThree();
  const group = useRef();
  const { scrollData } = useScrollStore();

  const spacing = useMemo(() => fontSize * 1.5, [fontSize]);
  const groupHeight = useMemo(() => spacing * words.length, [spacing, words]);
  const posX = useMemo(() => {
    const halfW = viewport.width / 2;
    return -halfW * 0.9;
  }, [viewport]);

  const generateScrollingText = useCallback(
    (word, position, index) => {
      return (
        <ScrollingText
          key={index}
          groupHeight={groupHeight}
          position={position}
          fontWeight={900}
          spacing={spacing}
          fontSize={fontSize}>
          {word.toUpperCase()}
        </ScrollingText>
      );
    },
    [groupHeight, fontSize, spacing]
  );

  useFrame(() => {
    group.current.position.y = groupHeight * scrollData.current.sectionProgress;
  });

  return (
    <group
      ref={group}
      position={position}>
      {[words[words.length - 1], words[words.length - 2]].map((word, index) =>
        generateScrollingText(word, [posX, index * spacing + spacing, 0], index)
      )}
      {words.map((word, index) => generateScrollingText(word, [posX, index * -spacing, 0], index))}
      {words
        .slice(0, 3)
        .map((word, index) =>
          generateScrollingText(
            word,
            [posX, index * -spacing - (words.length - 1) * spacing - spacing, 0],
            index
          )
        )}
    </group>
  );
};

export default TextList;
