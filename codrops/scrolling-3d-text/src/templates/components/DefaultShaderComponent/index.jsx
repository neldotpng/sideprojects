import { useRef } from "react";
import CustomShaderMaterial from "@/global/materials/CustomShaderMaterial";

import vertexShader from "./shaders/vertexShader.glsl?raw";
import fragmentShader from "./shaders/fragmentShader.glsl?raw";

const DefaultShaderComponent = () => {
  const customShaderMaterialRef = useRef();

  const onPointerMove = (e) => {
    customShaderMaterialRef.current.uMouse.set(e.uv.x, e.uv.y);
  };

  return (
    <mesh onPointerMove={onPointerMove}>
      <planeGeometry args={[1, 1, 2, 2]} />
      <CustomShaderMaterial
        ref={customShaderMaterialRef}
        uniforms={{}}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  );
};

export default DefaultShaderComponent;
