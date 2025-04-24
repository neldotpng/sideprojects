import { Canvas } from "@react-three/fiber";
import Scene from "@/components/three/Scene";

const App = () => {
  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <Canvas>
        <Scene />
      </Canvas>
    </div>
  );
};

export default App;
