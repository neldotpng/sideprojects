import { useThree, useFrame } from "@react-three/fiber";
import { useFBO } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import * as THREE from "three";

import useShaderPass from "./useShaderPass";
import useImpulse from "./useImpulse";

import outputVert from "./shaders/output.vert?raw";
import outputFrag from "./shaders/output.frag?raw";

const useLiquidBuffer = () => {
  const { gl, size } = useThree();
  const cellScale = useMemo(() => {
    return new THREE.Vector2(1 / size.width, 1 / size.height);
  }, [size]);

  // FBOs
  const impulse = useImpulse({ cellScale });
  const output = useFBO();

  const uniforms = useMemo(() => {
    return {
      uTexture: new THREE.Uniform(null),
      uTime: new THREE.Uniform(0),
    };
  }, []);

  useEffect(() => {
    gl.setClearColor("#000000");
  }, [gl]);

  useShaderPass({
    vertexShader: outputVert,
    fragmentShader: outputFrag,
    uniforms,
    fbo: output,
  });

  useFrame((state, dt) => {
    uniforms.uTexture.value = impulse.texture;
    uniforms.uTime.value += dt;
  });

  return output;
};

export default useLiquidBuffer;
