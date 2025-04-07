import { Canvas } from "@react-three/fiber";
import Debug from "./components/Debug";
import Plane from "./components/Plane";

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
        <Plane />
      </Canvas>
    </main>
  );
};

export default App;
