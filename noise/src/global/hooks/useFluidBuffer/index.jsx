import { useThree } from "@react-three/fiber";
import { useFBO } from "@react-three/drei";
import { LinearFilter, FloatType, RGBAFormat } from "three";

import useAdvection from "./useAdvection";
import useImpulse from "./useImpulse";
import useJacobi from "./useJacobi";
import useDivergence from "./useDivergence";
import useGradient from "./useGradient";
import useVorticity from "./useVorticity";
import useAddVorticity from "./useAddVorticity";
// import useColor from "./useColor";

const useFluidBuffer = ({
  resolution = 256,
  gridScale = 0.3,
  iterations = 20,
  fboSettings = {
    stencilBuffer: false,
    depthBuffer: false,
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    type: FloatType,
    format: RGBAFormat,
  },
} = {}) => {
  const { size } = useThree();

  // Main FBOS
  const velocityA = useFBO(resolution, resolution, fboSettings);
  const velocityB = useFBO(resolution, resolution, fboSettings);
  const pressure = useFBO(resolution, resolution, fboSettings);
  const buffer = useFBO(resolution, resolution, fboSettings);
  const jacobiSwap = useFBO(resolution, resolution, fboSettings);
  const vorticity = useFBO(resolution, resolution, fboSettings);

  /* FBO LOOP */
  // Apply Advection to input velocity (= last recorded velocity value)
  useAdvection({
    step: gridScale,
    dissipation: 1.25,
    inputFBO: buffer,
    outputFBO: velocityB,
  });
  // Apply external force impulse to base velocity
  useImpulse({
    cursorSize: size.width * 0.1,
    cursorForce: 12,
    inputFBO: velocityB,
    outputFBO: velocityA,
  });
  // Calculate divergence from velocity + impulse
  useDivergence({
    gridScale,
    inputFBO: velocityA,
    outputFBO: buffer,
  });
  // Use jacobi iteration to calculate pressure from divergence
  // Iterations = 20 minimum, >size == >accuracy
  useJacobi({
    iterations,
    tempFBO: jacobiSwap,
    inputFBO: buffer,
    outputFBO: pressure,
  });
  // Calculate gradient value of pressure and subtract from velocity
  useGradient({
    gridScale,
    pressureFBO: pressure,
    velocityFBO: velocityA,
    outputFBO: velocityB,
  });
  // Vorticity
  useVorticity({
    strength: 2,
    inputFBO: velocityB,
    outputFBO: vorticity,
  });
  useAddVorticity({
    gridScale,
    strength: 1,
    velocityFBO: velocityB,
    vorticityFBO: vorticity,
    outputFBO: buffer,
  });

  return { velocity: buffer };
};

export default useFluidBuffer;
