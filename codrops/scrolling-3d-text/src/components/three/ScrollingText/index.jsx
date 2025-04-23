import { useRef, useMemo, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

import CustomShaderMaterial from "@/global/materials/CustomShaderMaterial";
import vertexShader from "./shaders/vertexShader.glsl?raw";
import fragmentShader from "./shaders/fragmentShader.glsl?raw";

const ScrollingText = ({
  position = [0, 0, 0],
  fontSize = 1,
  groupHeight,
  scrollData,
  ...props
}) => {
  const intersecting = useRef(false);
  const textRef = useRef();
  const shaderRef = useRef();

  const calcIntersection = useCallback(
    (scrollData) => {
      const scroll3D = -scrollData.current.progress * groupHeight;
      const isNowIntersecting = scroll3D <= position[1] + 0.75 && scroll3D >= position[1] - 0.75;

      return isNowIntersecting;
    },
    [groupHeight, position]
  );

  const uniforms = useMemo(
    () => ({
      uScroll: 0,
      uIntersecting: false,
      uSpeed: 0,
    }),
    []
  );

  useFrame(() => {
    const isNowIntersecting = calcIntersection(scrollData);

    if (intersecting.current !== isNowIntersecting) {
      intersecting.current = isNowIntersecting;
      shaderRef.current.uniforms.uIntersecting.value = isNowIntersecting;
    }

    shaderRef.current.uniforms.uScroll.value = scrollData.current.progress;
  });

  return (
    <Text
      ref={textRef}
      fontSize={fontSize}
      position={position}
      anchorX={0}>
      <CustomShaderMaterial
        ref={shaderRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
      {props.children}
    </Text>
  );
};

export default ScrollingText;
