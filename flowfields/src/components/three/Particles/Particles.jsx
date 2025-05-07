import { useEffect, useRef, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

import CustomShaderMaterial from "@/global/materials/CustomShaderMaterial";
import vertex from "./shaders/vertex.glsl?raw";
import fragment from "./shaders/fragment.glsl?raw";

const Particles = ({ count }) => {
  const { viewport } = useThree();

  const positions = useMemo(() => new Float32Array(count * 3), [count]);
  const uniforms = useMemo(
    () => ({
      uRandomA: { value: Math.random() * 2 - 1 },
      uRandomB: { value: Math.random() * 2 - 1 },
      uRandomC: { value: Math.random() * 2 - 1 },
      uRandomD: { value: Math.random() * 2 - 1 },
      uPingPongTexture: { value: null },
    }),
    []
  );
  const shaderMaterial = useRef();
  const positionsAttribute = useRef();

  useEffect(() => {
    const halfW = viewport.width / 2;
    const halfH = viewport.height / 2;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3 + 0] = (Math.random() * 2 - 1) * halfW;
      positions[i3 + 1] = (Math.random() * 2 - 1) * halfH;
      positions[i3 + 2] = (Math.random() * 2 - 1) * halfW;
    }
    positionsAttribute.current.needsUpdate = true;
  }, [count, positions, viewport]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          ref={positionsAttribute}
          attach="attributes-position"
          array={positions}
          count={positions.length / 3}
          itemSize={3}
        />
        <bufferAttribute />
      </bufferGeometry>
      <CustomShaderMaterial
        ref={shaderMaterial}
        vertexShader={vertex}
        fragmentShader={fragment}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
      />
    </points>
  );
};

export default Particles;
