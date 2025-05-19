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

const useLiquidBuffer = ({
  resolution = 256,
  gridScale = 0.3,
  iterations = 20,
  diffuse = false,
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
  const velocity = useFBO(resolution, resolution, fboSettings);
  const impulse = useFBO(resolution, resolution, fboSettings);
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
    outputFBO: velocity,
  });
  // Apply external force impulse to base velocity
  useImpulse({
    cursorSize: 100,
    inputFBO: velocity,
    outputFBO: impulse,
  });
  // Vorticity
  useVorticity({
    strength: 1,
    inputFBO: impulse,
    outputFBO: vorticity,
  });
  // Add Vorticity
  useAddVorticity({
    gridScale,
    strength: 0.01,
    vorticityFBO: vorticity,
    velocityFBO: impulse,
    outputFBO: velocity,
  });
  // Apply viscous diffusion
  // Use jacobi iteration to calculate diffusion
  useViscous({
    gridScale,
    iterations: diffuse ? iterations : 0,
    viscosity: 0.01,
    tempFBO: jacobiSwap,
    inputFBO: impulse,
    outputFBO: velocity,
  });
  // Calculate divergence from velocity + impulse
  useDivergence({
    gridScale,
    inputFBO: diffuse ? velocity : velocity,
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
    velocityFBO: diffuse ? velocity : velocity,
    outputFBO: gradient,
  });
  // Render colors onto final velocity output from gradient
  useColor({
    inputFBO: gradient,
    outputFBO: color,
  });

  return color;
};

export default useLiquidBuffer;
