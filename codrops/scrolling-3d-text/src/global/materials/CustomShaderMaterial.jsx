import { useEffect } from "react";
import { extend, useFrame, useThree } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";

const ShaderMaterialInstance = shaderMaterial({}, `// vertexShader`, `// fragmentShader`);

extend({ ShaderMaterialInstance });

const CustomShaderMaterial = ({
  disableMouse = false,
  normalizedMouse = true,
  uniforms,
  ref,
  ...props
}) => {
  const { size } = useThree();

  const instanceUniforms = {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uResolution: { value: new THREE.Vector2(0, 0) },
  };

  useEffect(() => {
    ref.current.uniforms.uResolution.value.set(size.width, size.height);
  }, [size, ref]);

  useFrame(({ pointer }, delta) => {
    ref.current.uniforms.uTime.value += delta;

    if (!disableMouse) {
      if (normalizedMouse) {
        ref.current.uniforms.uMouse.value.set(pointer.x, pointer.y);
      } else {
        const mouse = pointer.clone().addScalar(1).divideScalar(2);
        ref.current.uniforms.uMouse.value.set(mouse.x, mouse.y);
      }
    }
  });

  return (
    <shaderMaterialInstance
      {...props}
      ref={ref}
      uniforms={{ ...instanceUniforms, ...uniforms }}
      // Random Key Generated when imported shaders are updated
      key={`${ShaderMaterialInstance.key}-${Math.random()}}`}
    />
  );
};

export default CustomShaderMaterial;
