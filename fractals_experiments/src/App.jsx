import { Canvas } from "@react-three/fiber";
import Debug from "./components/Debug";
import FullscreenShaderPlane from "./components/FullscreenShaderPlane";
// import DefaultShaderComponent from "./components/DefaultShaderComponent";

const App = () => {
  return (
    <main id="canvas-container">
      <Canvas>
        <Debug />

        <ambientLight intensity={0.1} />
        <directionalLight
          color="red"
          position={[0, 0, 5]}
        />
        <FullscreenShaderPlane />
        {/* <DefaultShaderComponent /> */}
      </Canvas>
    </main>
  );
};

export default App;
