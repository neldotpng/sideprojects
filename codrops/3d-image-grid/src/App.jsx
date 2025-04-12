import { Canvas } from "@react-three/fiber";
import Debug from "./components/Debug";
import Grid from "./components/Grid";

const App = () => {
  return (
    <main id="canvas-container">
      <Canvas
        orthographic
        camera={{ near: 0.1, far: 1000, position: [0, 0, 10] }}>
        <Debug />

        <Grid
          imageSize={20}
          margins={50}
          imageScale={4}
          hoverRadius={8}
        />
      </Canvas>
    </main>
  );
};

export default App;
