import { useEffect } from "react";
import { extend, useFrame, useThree } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";

const ShaderMaterialInstance = shaderMaterial({}, `// vertexShader`, `// fragmentShader`);

extend({ ShaderMaterialInstance });

const CustomShaderMaterial = ({
  disableMouse = false, // Can use MouseStore to update if disabled
  normalizedMouse = true,
  uniforms,
  ref,
  ...props
}) => {
  const { viewport } = useThree();

  const instanceUniforms = {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uResolution: { value: new THREE.Vector2(viewport.width, viewport.height) },
  };

  useEffect(() => {
    ref.current.uniforms.uResolution.value.set(viewport.width, viewport.height);
  }, [viewport, ref]);

  useFrame(({ pointer }, dt) => {
    ref.current.uniforms.uTime.value += dt;

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
