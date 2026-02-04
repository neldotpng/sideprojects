import { useEffect, useMemo } from "react";
import { extend, useFrame, useThree } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";

const ShaderMaterialInstance = shaderMaterial(
  {},
  ` 
  uniform float uTime;
  uniform vec2 uMouse;
  uniform vec2 uResolution;

  varying vec2 vUv;

  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);

    vUv = uv;
  }`,
  ` 
  uniform float uTime;
  uniform vec2 uMouse;
  uniform vec2 uResolution;

  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;

    gl_FragColor = vec4(uv, 0., 1.);
  }`,
);

extend({ ShaderMaterialInstance });

const CustomShaderMaterial = ({
  disableMouse = false, // Can use MouseStore to update if disabled
  normalizedMouse = true,
  uniforms,
  ...props
}) => {
  const { size, viewport } = useThree();

  const instanceUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDeltaTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uResolution: { value: new THREE.Vector2() },
      uViewport: { value: new THREE.Vector2() },
    }),
    [],
  );

  useEffect(() => {
    instanceUniforms.uResolution.value.set(size.width, size.height);
    instanceUniforms.uViewport.value.set(viewport.width, viewport.height);
  }, [size, viewport, instanceUniforms]);

  useFrame(({ pointer }, dt) => {
    instanceUniforms.uDeltaTime = dt;
    instanceUniforms.uTime.value += dt;

    if (!disableMouse) {
      if (normalizedMouse) {
        instanceUniforms.uMouse.value.set(pointer.x, pointer.y);
      } else {
        const mouse = pointer.clone().addScalar(1).divideScalar(2);
        instanceUniforms.uMouse.value.set(mouse.x, mouse.y);
      }
    }
  });

  return (
    <shaderMaterialInstance
      {...props}
      uniforms={{ ...instanceUniforms, ...uniforms }}
      // Random Key Generated when imported shaders are updated
      key={`${ShaderMaterialInstance.key}-${Math.random()}}`}
    />
  );
};

export default CustomShaderMaterial;
