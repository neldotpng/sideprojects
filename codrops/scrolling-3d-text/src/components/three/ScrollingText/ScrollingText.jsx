import { useRef, useMemo, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
// import * as THREE from "three";

import { useScrollStore } from "@/global/Store";
import CustomShaderMaterial from "@/global/materials/CustomShaderMaterial";
import vertexShader from "./shaders/vertexShader.glsl?raw";
import fragmentShader from "./shaders/fragmentShader.glsl?raw";

const ScrollingText = ({ position = [0, 0, 0], fontSize = 1, groupHeight, ...props }) => {
  // Get ScrollerContext data
  const { scrollData, lenis } = useScrollStore();

  const intersecting = useRef(false);
  const textRef = useRef();
  const shaderRef = useRef();

  const calcIntersection = useCallback(
    (scrollData) => {
      if (!scrollData.current) return false;

      const scroll3D = -scrollData.current.progress * groupHeight;
      const range = [position[1] + 0.75, position[1] - 0.75];

      return [scroll3D, range];
    },
    [groupHeight, position]
  );

  const uniforms = useMemo(
    () => ({
      uScroll: { value: 0 },
      uIntersecting: { value: false },
      uVelocity: { value: 0 },
      uIntersectionStrength: { value: 0 },
    }),
    []
  );

  useFrame(() => {
    const [scroll3D, range] = calcIntersection(scrollData);
    const isNowIntersecting = scroll3D <= range[0] && scroll3D >= range[1];

    if (intersecting.current !== isNowIntersecting) {
      intersecting.current = isNowIntersecting;
      shaderRef.current.uniforms.uIntersecting.value = isNowIntersecting;
    }

    if (isNowIntersecting) {
      const mean = (range[0] + range[1]) / 2;
      const strength = 1 - Math.abs(Math.pow(scroll3D - mean, 3));
      shaderRef.current.uniforms.uIntersectionStrength.value = strength;
    } else {
      shaderRef.current.uniforms.uIntersectionStrength.value = 0;
    }

    shaderRef.current.uniforms.uScroll.value = scrollData.current.progress;
    shaderRef.current.uniforms.uVelocity.value = lenis.current.velocity;
  });

  return (
    <Text
      ref={textRef}
      fontSize={fontSize}
      position={position}
      anchorX={0}
      {...props}>
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
