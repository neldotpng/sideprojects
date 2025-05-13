import { useThree, useFrame } from "@react-three/fiber";
import { useFBO } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import { LinearFilter, FloatType, RGBAFormat, Uniform, Vector2 } from "three";

import useShaderPass from "./useShaderPass";
import useImpulse from "./useImpulse";
import useAdvection from "./useAdvection";
import useJacobi from "./useJacobi";
import outputFrag from "./shaders/output.frag?raw";
import useDivergence from "./useDivergence";
import useGradient from "./useGradient";
import useBoundary from "./useBoundary";

const useLiquidBuffer = (
  resolution = 256,
  options = {
    stencilBuffer: false,
    depthBuffer: false,
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    type: FloatType,
    format: RGBAFormat,
  }
) => {
  const { gl, size } = useThree();
  const cellScale = useMemo(() => {
    return new Vector2(1 / size.width, 1 / size.height);
  }, [size]);

  // Main FBOS
  const temp = useFBO(resolution, resolution, options);
  const inVel = useFBO(resolution, resolution, options);
  const outVel = useFBO(resolution, resolution, options);

  // FBO loop
  const advectionRef = useAdvection({
    cellScale,
    resolution,
    options,
    inputFBO: inVel,
  });
  // const viscousRef = useJacobi({
  //   cellScale,
  //   resolution,
  //   options,
  //   inputTexture: advectionRef,
  //   tempFBO: temp,
  //   iterations: 20,
  // });
  const impulseRef = useImpulse({ cellScale, resolution, options, inputTexture: advectionRef });
  const divergenceRef = useDivergence({ cellScale, resolution, options, inputTexture: impulseRef });
  const poissonRef = useJacobi({
    cellScale,
    resolution,
    options,
    inputTexture: divergenceRef,
    tempFBO: temp,
    iterations: 40,
    alpha: -(0.25 * 0.25),
    beta: 4,
  });
  const gradientRef = useGradient({
    cellScale,
    resolution,
    options,
    pressureTexture: poissonRef,
    velocityTexture: impulseRef,
  });
  const boundaryRef = useBoundary({
    cellScale,
    resolution,
    options,
    inputTexture: gradientRef,
  });

  const uniforms = useMemo(() => {
    return {
      uTexture: new Uniform(null),
      uTime: new Uniform(0),
      uCellScale: new Uniform(cellScale),
    };
  }, [cellScale]);

  useEffect(() => {
    gl.setClearColor("#000000");
  }, [gl]);

  const outputRef = useShaderPass({
    fragmentShader: outputFrag,
    uniforms,
    fbo: outVel,
  });

  useFrame((state, dt) => {
    inVel.texture = outputRef.current;
    uniforms.uTexture.value = boundaryRef.current;
    uniforms.uTime.value += dt;
  });

  return outputRef;
};

export default useLiquidBuffer;
