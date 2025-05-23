import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import CustomShaderMaterial from "@/global/materials/CustomShaderMaterial";

import vertexShader from "./shaders/vertexShader.glsl?raw";
import fragmentShader from "./shaders/fragmentShader.glsl?raw";

const Plane = ({ segments = 2 }) => {
  const { viewport } = useThree();
  const plane = useRef();
  const customShaderMaterial = useRef();

  useEffect(() => {
    plane.current.scale.x = viewport.width;
    plane.current.scale.y = viewport.height;
  }, [viewport]);

  return (
    <mesh ref={plane}>
      <planeGeometry args={[1, 1, segments, segments]} />
      <CustomShaderMaterial
        ref={customShaderMaterial}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  );
};

export default Plane;
