import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import { useFBO } from "@react-three/drei";
import * as THREE from "three";

import useShaderPass from "./useShaderPass";

import outputVert from "./shaders/output.vert?raw";
import advectionFrag from "./shaders/advection.frag?raw";

const useAdvection = ({ cellScale, inTexture }) => {
  const advection = useFBO();

  const uniforms = useMemo(() => {
    return {
      uPx: new THREE.Uniform(cellScale),
      uTexture: new THREE.Uniform(inTexture),
      uBoundary: new THREE.Uniform(cellScale),
    };
  }, [cellScale, inTexture]);

  useShaderPass({
    vertexShader: outputVert,
    fragmentShader: advectionFrag,
    uniforms,
    fbo: advection,
  });

  useFrame(() => {});

  return advection;
};

export default useAdvection;
