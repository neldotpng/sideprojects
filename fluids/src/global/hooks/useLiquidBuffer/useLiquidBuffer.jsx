import { useFBO } from "@react-three/drei";
import { useMemo } from "react";
import { LinearFilter, FloatType, RGBAFormat } from "three";

import useImpulse from "./useImpulse";
import useAdvection from "./useAdvection";
import useJacobi from "./useJacobi";
import useDivergence from "./useDivergence";
import useGradient from "./useGradient";
import useColor from "./useColor";

const useLiquidBuffer = (
  resolution = 500,
  options = {
    stencilBuffer: false,
    depthBuffer: false,
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    type: FloatType,
    format: RGBAFormat,
  }
) => {
  const gridScale = useMemo(() => 0.3, []);

  // Main FBOS
  const velocity = useFBO(resolution, resolution, options);
  const impulse = useFBO(resolution, resolution, options);
  const divergence = useFBO(resolution, resolution, options);
  const pressure = useFBO(resolution, resolution, options);
  const gradient = useFBO(resolution, resolution, options);
  const color = useFBO(resolution, resolution, options);
  const temp = useFBO(resolution, resolution, options);

  // FBO loop
  useAdvection({
    gridScale,
    inputFBO: gradient,
    outputFBO: velocity,
  });
  useImpulse({
    gridScale,
    inputFBO: velocity,
    outputFBO: impulse,
  });
  useDivergence({
    gridScale,
    inputFBO: impulse,
    outputFBO: divergence,
  });
  useJacobi({
    inputFBO: divergence,
    outputFBO: pressure,
    tempFBO: temp,
    iterations: 20,
    alpha: -gridScale * gridScale,
    beta: 4,
  });
  useGradient({
    gridScale,
    pressureFBO: pressure,
    velocityFBO: impulse,
    outputFBO: gradient,
  });
  useColor({
    inputFBO: gradient,
    outputFBO: color,
  });

  return color;
};

export default useLiquidBuffer;
