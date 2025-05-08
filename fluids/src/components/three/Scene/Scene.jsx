import { Canvas } from "@react-three/fiber";

import FullscreenShaderPlane from "@/templates/components/FullscreenShaderPlane";
import DefaultShaderComponent from "@/templates/components/DefaultShaderComponent";
import Debug from "@/global/Debug";

const Scene = () => {
  return (
    <Canvas>
      <Debug />
      <ambientLight intensity={0.1} />
      <directionalLight
        color="red"
        position={[0, 0, 5]}
      />
      <FullscreenShaderPlane />
      <DefaultShaderComponent />
    </Canvas>
  );
};

export default Scene;
