import { useFrame, useThree } from "@react-three/fiber";
import vertexShader from "./shaders/vertexShader.glsl?raw";
import fragmentShader from "./shaders/fragmentShader.glsl?raw";
import { useEffect, useRef, useMemo } from "react";
import * as THREE from "three";

import CustomShaderMaterial from "../../global/materials/CustomShaderMaterial";

const Plane = ({ segments = 128 }) => {
  const { viewport, size } = useThree();
  const plane = useRef();
  const materialRef = useRef();

  useEffect(() => {
    plane.current.scale.x = viewport.width;
    plane.current.scale.y = viewport.height;
  }, [viewport]);

  const uniforms = useMemo(
    () => ({
      // uTime: { value: 0 },
      // uResolution: { value: new THREE.Vector2(size.width, size.height) },
      // uMouse: { value: new THREE.Vector2(0, 0) },
    }),
    []
  );

  // useFrame(({ clock }) => {
  //   uniforms.uTime.value = clock.getElapsedTime();
  // });

  // const onPointerMove = (e) => {
  //   uniforms.uMouse.value.set(e.offsetX, size.height - e.offsetY);
  // };

  return (
    <mesh ref={plane}>
      <planeGeometry args={[1, 1, segments, segments]} />
      <CustomShaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        ref={materialRef}
      />
    </mesh>
  );
};

export default Plane;
