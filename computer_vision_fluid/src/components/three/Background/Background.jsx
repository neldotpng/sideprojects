import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useControls, folder } from "leva";

import CustomShaderMaterial from "@/global/materials/CustomShaderMaterial";
import backgroundVert from "./shaders/background.vert?raw";
import backgroundFrag from "./shaders/background.frag?raw";

const Background = ({ fluidTexture }) => {
  const { ENABLE, PIXEL_SIZE, STRENGTH } = useControls({
    "Dark Liquid": folder({
      ENABLE: { value: false, label: "Enable" },
      PIXEL_SIZE: { value: 1, min: 1, max: 100, step: 1, label: "Pixel Size" },
      STRENGTH: { value: 0.5, min: 0.01, max: 2, step: 0.01, label: "Fade Strength" },
    }),
  });
  const meshRef = useRef();
  const { viewport } = useThree();

  const uniforms = useMemo(
    () => ({
      uTexture: { value: null },
      uPosition: { value: new THREE.Vector3() },
      uPixelSize: { value: PIXEL_SIZE },
      uFadeStrength: { value: STRENGTH },
    }),
    [PIXEL_SIZE, STRENGTH]
  );

  useFrame(() => {
    meshRef.current.material.uniforms.uTexture.value = fluidTexture;
  });

  return (
    <mesh
      ref={meshRef}
      position={[0, 0, -0.5]}
      scale={[viewport.width * 1.1, viewport.height * 1.1, 1]}
      visible={ENABLE}>
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
