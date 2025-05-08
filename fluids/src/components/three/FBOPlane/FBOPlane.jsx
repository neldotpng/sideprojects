import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import CustomShaderMaterial from "@/global/materials/CustomShaderMaterial";

import vertexShader from "./shaders/vertexShader.glsl?raw";
import fragmentShader from "./shaders/fragmentShader.glsl?raw";

const FBOPlane = ({ segments = 2, texture, pingPongTextureRef }) => {
  const { viewport } = useThree();
  const plane = useRef();
  const customShaderMaterial = useRef();

  useEffect(() => {
    plane.current.scale.x = viewport.width;
    plane.current.scale.y = viewport.height;
  }, [viewport]);

  useFrame(() => {
    customShaderMaterial.current.uniforms.uTexture.value = texture;
    customShaderMaterial.current.uniforms.uPingPongTexture.value = pingPongTextureRef.current;
  });

  return (
    <mesh ref={plane}>
      <planeGeometry args={[1, 1, segments, segments]} />
      <CustomShaderMaterial
        ref={customShaderMaterial}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTexture: { value: null },
          uPingPongTexture: { value: null },
        }}
      />
    </mesh>
  );
};

export default FBOPlane;
