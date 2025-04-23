import { useEffect } from "react";
import { extend, useFrame, useThree } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";

const CustomShaderMaterial = ({ vertexShader, fragmentShader, uniforms, ref, ...props }) => {
  const { size } = useThree();

  const ShaderMaterialInstance = shaderMaterial(
    {
      uTime: 0,
      uMouse: new THREE.Vector2(0, 0),
      uResolution: new THREE.Vector2(size.width, size.height),
      ...uniforms,
    },
    `// vertexShader`,
    `// fragmentShader`
  );

  extend({ ShaderMaterialInstance });

  useEffect(() => {
    ref.current?.uResolution.set(size.width, size.height);
  }, [size, ref]);

  useFrame((state, delta) => {
    ref.current.uTime += delta;
  });

  return (
    <shaderMaterialInstance
      {...props}
      ref={ref}
      // Random Key Generated when imported shaders are updated
      key={`${ShaderMaterialInstance.key}-${Math.random()}}`}
      vertexShader={vertexShader}
      fragmentShader={fragmentShader}
    />
  );
};

export default CustomShaderMaterial;
