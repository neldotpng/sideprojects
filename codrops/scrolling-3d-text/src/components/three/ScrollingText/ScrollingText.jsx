import { useRef, useMemo, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";

import { useScrollStore, usePingPongStore } from "@/global/Store";
import CustomShaderMaterial from "@/global/materials/CustomShaderMaterial";
import vertexShader from "./shaders/vertexShader.glsl?raw";
import fragmentShader from "./shaders/fragmentShader.glsl?raw";

const ScrollingText = ({ position = [0, 0, 0], fontSize = 1, groupHeight, spacing, ...props }) => {
  // Get ScrollerContext data
  const { scrollData, lenis } = useScrollStore();
  const { pingPongTexture } = usePingPongStore();

  const intersecting = useRef(false);
  const textRef = useRef();
  const shaderRef = useRef();

  const calcIntersection = useCallback(
    (scrollData) => {
      if (!scrollData.current) return false;

      const scroll3D = -scrollData.current.progress * groupHeight;
      const range = [position[1] + spacing / 2, position[1] - spacing / 2];

      return [scroll3D, range];
    },
    [groupHeight, position, spacing]
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
    shaderRef.current.uniforms.uPingPongTexture.value = pingPongTexture.current;
  });

  return (
    <Text
      ref={textRef}
      fontSize={fontSize}
      position={position}
      anchorX={0}
      glyphGeometryDetail={25}
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
