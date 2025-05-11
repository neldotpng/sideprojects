import { useThree, useFrame } from "@react-three/fiber";
import { useFBO } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import { LinearFilter, FloatType, RGBAFormat, Uniform, Vector2 } from "three";

import useShaderPass from "./useShaderPass";
import useImpulse from "./useImpulse";
import useAdvection from "./useAdvection";
import useJacobi from "./useJacobi";

import outputVert from "./shaders/output.vert?raw";
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

  // FBOs
  const impulseRef = useImpulse({ cellScale, resolution, options });
  const advectionRef = useAdvection({ cellScale, resolution, options, inTexture: impulseRef });
  const jacobiRef = useJacobi({ cellScale, resolution, options, inTexture: advectionRef });
  const output = useFBO(resolution, resolution, options);

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
    vertexShader: outputVert,
    fragmentShader: outputFrag,
    uniforms,
    fbo: output,
  });

  useFrame((state, dt) => {
    uniforms.uTexture.value = jacobiRef.current;
    uniforms.uTime.value += dt;
  });

  return outputRef;
};

export default useLiquidBuffer;
