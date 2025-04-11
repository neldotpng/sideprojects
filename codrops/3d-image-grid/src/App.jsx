import { Canvas } from "@react-three/fiber";
import Debug from "./components/Debug";
import FullscreenShaderPlane from "./components/FullscreenShaderPlane";
import Grid from "./components/Grid";

const App = () => {
  return (
    <main id="canvas-container">
      <Canvas
        orthographic
        camera={{ near: 0.1, far: 1000, position: [0, 0, 10] }}>
        <Debug />

        <ambientLight intensity={0.1} />
        <directionalLight
          color="red"
          position={[0, 0, 5]}
        />
        {/* <FullscreenShaderPlane /> */}
        <Grid />
      </Canvas>
    </main>
  );
};

export default App;
