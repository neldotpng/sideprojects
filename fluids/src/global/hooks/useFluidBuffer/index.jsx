import { useFBO } from "@react-three/drei";
import { LinearFilter, FloatType, RGBAFormat } from "three";

import useAdvection from "./useAdvection";
import useImpulse from "./useImpulse";
import useViscous from "./useViscous";
import useJacobi from "./useJacobi";
import useDivergence from "./useDivergence";
import useGradient from "./useGradient";
import useColor from "./useColor";
import useVorticity from "./useVorticity";
import useAddVorticity from "./useAddVorticity";

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
  // Main FBOS
  const velocityA = useFBO(resolution, resolution, fboSettings);
  const velocityB = useFBO(resolution, resolution, fboSettings);
  const vorticity = useFBO(resolution, resolution, fboSettings);
  const divergence = useFBO(resolution, resolution, fboSettings);
  const pressure = useFBO(resolution, resolution, fboSettings);
  const gradient = useFBO(resolution, resolution, fboSettings);
  const color = useFBO(resolution, resolution, fboSettings);
  const jacobiSwap = useFBO(resolution, resolution, fboSettings);

  /* FBO LOOP */
  // Apply Advection to input velocity (= last recorded velocity value)
  useAdvection({
    step: gridScale,
    inputFBO: gradient,
    outputFBO: velocityA,
  });
  // Apply viscous diffusion
  // Use jacobi iteration to calculate diffusion
  useViscous({
    gridScale,
    iterations,
    viscosity: 50,
    tempFBO: jacobiSwap,
    inputFBO: velocityA,
    outputFBO: velocityB,
  });
  // Apply external force impulse to base velocity
  useImpulse({
    cursorSize: 100,
    inputFBO: velocityB,
    outputFBO: velocityA,
  });
  // Vorticity
  useVorticity({
    strength: 1,
    inputFBO: velocityA,
    outputFBO: vorticity,
  });
  // Add Vorticity
  useAddVorticity({
    gridScale,
    strength: 0.01,
    vorticityFBO: vorticity,
    velocityFBO: velocityA,
    outputFBO: velocityB,
  });
  // Calculate divergence from velocity + impulse
  useDivergence({
    gridScale,
    inputFBO: velocityB,
    outputFBO: divergence,
  });
  // Use jacobi iteration to calculate pressure from divergence
  // Iterations = 20 minimum, >size == >accuracy
  useJacobi({
    iterations,
    tempFBO: jacobiSwap,
    inputFBO: divergence,
    outputFBO: pressure,
  });
  // Calculate gradient value of pressure and subtract from velocity
  useGradient({
    gridScale,
    pressureFBO: pressure,
    velocityFBO: velocityB,
    outputFBO: gradient,
  });
  // Render colors onto final velocity output from gradient
  useColor({
    inputFBO: gradient,
    outputFBO: color,
  });

  return color;
};

export default useFluidBuffer;
