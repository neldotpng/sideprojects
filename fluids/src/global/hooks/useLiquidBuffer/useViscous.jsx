import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Uniform } from "three";

import useJacobi from "./useJacobi";

const useViscous = ({ gridScale, iterations, viscosity = 0.001, inputFBO, outputFBO, tempFBO }) => {
  const alphaRef = useRef((gridScale * gridScale) / (viscosity * 0.0167));
  const betaRef = useRef(4 + alphaRef.current);

  const uniforms = useMemo(() => {
    return {
      uGridScale: new Uniform(gridScale),
      uVelocity: new Uniform(inputFBO.texture),
    };
  }, [gridScale, inputFBO]);

  const viscousTextureRef = useJacobi({
    iterations,
    alphaRef,
    betaRef,
    inputFBO,
    outputFBO,
    tempFBO,
  });

  useFrame((state, delta) => {
    const dt = delta !== 0 ? delta : 0.0167;
    alphaRef.current = (gridScale * gridScale) / (viscosity * dt);
    betaRef.current = 4 + alphaRef.current;

    uniforms.uVelocity.value = inputFBO.texture;
  });

  return viscousTextureRef;
};

export default useViscous;
