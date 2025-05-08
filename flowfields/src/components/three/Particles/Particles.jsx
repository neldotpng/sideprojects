import { useEffect, useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { useMouseStore } from "@/global/Stores";
import CustomShaderMaterial from "@/global/materials/CustomShaderMaterial";
import vertex from "./shaders/vertex.glsl?raw";
import fragment from "./shaders/fragment.glsl?raw";

const Particles = ({ count }) => {
  const { viewport, camera } = useThree();
  const { mouseData } = useMouseStore();
  const pointsRef = useRef();
  const pointsGeometryRef = useRef();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);

  const positions = useMemo(() => new Float32Array(count * 3), [count]);
  const uniforms = useMemo(
    () => ({
      uRandomA: { value: Math.random() * 2 - 1 },
      uRandomB: { value: Math.random() * 2 - 1 },
      uRandomC: { value: Math.random() * 2 - 1 },
      uRandomD: { value: Math.random() * 2 - 1 },
      uCamera: { value: new THREE.Vector3(0, 0, 0) },
      uRaycastDirection: { value: new THREE.Vector3(0, 0, 0) },
      uVelocity: { value: new THREE.Vector2(0, 0) },
    }),
    []
  );
  const shaderMaterial = useRef();
  const positionsAttribute = useRef();

  useEffect(() => {
    raycaster.params.Points.threshold = 0.05;
  }, [raycaster]);

  useEffect(() => {
    const halfW = viewport.width / 2;
    const halfH = viewport.height / 2;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3 + 0] = (Math.random() * 2 - 1) * halfW;
      positions[i3 + 1] = (Math.random() * 2 - 1) * halfH;
      positions[i3 + 2] = (Math.random() * 2 - 1) * 1;
    }
    positionsAttribute.current.needsUpdate = true;
    pointsGeometryRef.current.computeBoundingSphere();
  }, [count, positions, viewport]);

  useFrame((state, dt) => {
    if (!mouseData.current) return;
    const { position: pointer, velocity } = mouseData.current;
    shaderMaterial.current.uniforms.uVelocity.value.lerp(velocity, 1 - Math.pow(0.25, dt));

    raycaster.setFromCamera(pointer, camera);

    const dir = raycaster.ray.direction;
    const cameraPos = camera.position;
    shaderMaterial.current.uniforms.uCamera.value.set(cameraPos.x, cameraPos.y, cameraPos.z);
    shaderMaterial.current.uniforms.uRaycastDirection.value.set(dir.x, dir.y, dir.z);
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry ref={pointsGeometryRef}>
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
        depthTest
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        // disableMouse
      />
    </points>
  );
};

export default Particles;
