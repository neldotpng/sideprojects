import { Canvas } from "@react-three/fiber";
import Debug from "./components/Debug";
import PingPongScene from "./components/PingPongScene";

const App = () => {
  return (
    <main id="canvas-container">
      <Canvas>
        {/* <Debug /> */}

        <ambientLight intensity={0.1} />
        <directionalLight
          color="red"
          position={[0, 0, 5]}
        />

        <PingPongScene />
      </Canvas>
    </main>
  );
};

export default App;
