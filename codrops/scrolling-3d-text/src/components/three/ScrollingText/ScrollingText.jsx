import { useRef, useMemo, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

import { useScrollStore, usePingPongStore } from "@/global/Store";
import CustomShaderMaterial from "@/global/materials/CustomShaderMaterial";
import vertexShader from "./shaders/vertexShader.glsl?raw";
import fragmentShader from "./shaders/fragmentShader.glsl?raw";

const ScrollingText = ({ position = [0, 0, 0], fontSize = 1, groupHeight, spacing, ...props }) => {
  const { size } = useThree();

  // Get ScrollerContext data
  const { scrollData, lenis } = useScrollStore();
  const { pingPongTexture } = usePingPongStore();

  const intersecting = useRef(false);
  const textRef = useRef();
  const shaderRef = useRef();

  const calcIntersection = useCallback(
    (scrollData) => {
      if (!scrollData.current) return [0, 0];

      const scrollHeight = scrollData.current.sectionInfo[0].height - size.height;
      const scroll3D = -scrollData.current.progress * groupHeight;
      const position3D = position[1];
      const range = [position3D + spacing / 2, position3D - spacing / 2];
      const scrollToPos = -(position3D / groupHeight) * scrollHeight;

      return [scroll3D, range, scrollToPos];
    },
    [groupHeight, position, spacing, size]
  );

  const uniforms = useMemo(
    () => ({
      uScroll: { value: 0 },
      uIntersecting: { value: false },
      uVelocity: { value: 0 },
      uIntersectionStrength: { value: 0 },
      uPingPongTexture: { value: null },
    }),
    []
  );

  // // How much text fits in the viewport
  // const textHeight = textRef.current.geometry.boundingBox.max.y * 4;
  // const totalWordsInView = (viewport.height * 2) / textHeight;

  useFrame(() => {
    const [scroll3D, range, scrollToPos] = calcIntersection(scrollData);
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

    shaderRef.current.uniforms.uScroll.value = scrollData.current?.progress;
    shaderRef.current.uniforms.uVelocity.value = lenis.current?.velocity;
    shaderRef.current.uniforms.uPingPongTexture.value = pingPongTexture.current;

    if (isNowIntersecting && lenis.current.velocity === 0) {
      lenis.current.scrollTo(scrollToPos);
    }
  });

  return (
    <Text
      ref={textRef}
      fontSize={fontSize}
      position={position}
      anchorX={0}
      glyphGeometryDetail={1}
      {...props}>
      <CustomShaderMaterial
        ref={shaderRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        disableMouse={true}
      />
      {props.children}
    </Text>
  );
};

export default ScrollingText;
