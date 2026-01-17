import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import CustomShaderMaterial from "@/global/materials/CustomShaderMaterial";
import backgroundVert from "./shaders/background.vert?raw";
import backgroundFrag from "./shaders/background.frag?raw";

const Background = ({ fluidTexture }) => {
  const meshRef = useRef();
  const { viewport } = useThree();

  const uniforms = {
    uTexture: { value: null },
    uPosition: { value: new THREE.Vector3() },
  };

  useFrame(() => {
    meshRef.current.material.uniforms.uTexture.value = fluidTexture;
  });

  return (
    <mesh
      ref={meshRef}
      position={[0, 0, -0.5]}
      scale={[viewport.width * 1.1, viewport.height * 1.1, 1]}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <CustomShaderMaterial
        vertexShader={backgroundVert}
        fragmentShader={backgroundFrag}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
};

export default Background;
