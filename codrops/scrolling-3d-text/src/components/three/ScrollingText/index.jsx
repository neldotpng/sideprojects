import { useRef, useMemo, useEffect } from "react";
import { Text, useScroll } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import CustomShaderMaterial from "@/global/materials/CustomShaderMaterial";
import vertexShader from "./shaders/vertexShader.glsl?raw";
import fragmentShader from "./shaders/fragmentShader.glsl?raw";

const ScrollingText = ({ position = [0, 0, 0], fontSize = 1, ...props }) => {
  const data = useScroll();
  const textRef = useRef();
  const shaderRef = useRef();

  const uniforms = useMemo(
    () => ({
      uScroll: 0,
      uIntersecting: false,
      uSpeed: 0,
    }),
    []
  );

  useFrame(() => {
    // console.dir(data.el.scrollTop);
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
