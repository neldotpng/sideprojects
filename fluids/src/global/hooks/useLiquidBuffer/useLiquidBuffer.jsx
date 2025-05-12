import { useThree, useFrame } from "@react-three/fiber";
import { useFBO } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import { LinearFilter, FloatType, RGBAFormat, Uniform, Vector2 } from "three";

import useShaderPass from "./useShaderPass";
import useImpulse from "./useImpulse";
import useAdvection from "./useAdvection";
import useJacobi from "./useJacobi";
import outputFrag from "./shaders/output.frag?raw";

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
  const inVel = useFBO(resolution, resolution, options);
  const outVel = useFBO(resolution, resolution, options);

  // FBO loop
  const advectionRef = useAdvection({ cellScale, resolution, options, inTexture: inVel.texture });
  const jacobiRef = useJacobi({ cellScale, resolution, options, inTexture: advectionRef });
  const impulseRef = useImpulse({ cellScale, resolution, options, inTexture: jacobiRef });

  const uniforms = useMemo(() => {
    return {
      uTexture: new Uniform(null),
      uTime: new Uniform(0),
    };
  }, []);

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
    uniforms.uTexture.value = impulseRef.current;
    uniforms.uTime.value += dt;
  });

  return outputRef;
};

export default useLiquidBuffer;
