import { useFrame, useThree } from "@react-three/fiber";
import vertexShader from "./shaders/vertexShader.glsl?raw";
import fragmentShader from "./shaders/fragmentShader.glsl?raw";
import { useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import { useControls } from "leva";

const Plane = ({ segments = 128 }) => {
  const { viewport, size } = useThree();
  const plane = useRef();
  const { progress, testValue } = useControls("Uniforms", {
    progress: {
      value: 0,
      min: 0,
      max: 1,
      step: 0.001,
    },
    testValue: {
      value: 0,
      min: -1,
      max: 1,
      step: 0.001,
    },
  });

  useEffect(() => {
    plane.current.scale.x = viewport.width;
    plane.current.scale.y = viewport.height;
  }, [viewport]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uProgress: { value: 0 },
      uTest: { value: 0 },
    }),
    [size]
  );

  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.getElapsedTime();
    uniforms.uProgress.value = progress;
    uniforms.uTest.value = testValue;
  });

  const onPointerMove = (e) => {
    uniforms.uMouse.value.set(e.offsetX, size.height - e.offsetY);
  };

  return (
    <mesh
      ref={plane}
      onPointerMove={onPointerMove}>
      <planeGeometry args={[1, 1, segments, segments]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
};

export default Plane;
