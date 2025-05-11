import { Canvas } from "@react-three/fiber";
import Scene from "@/components/three/Scene/Scene";

const App = () => {
  return (
    <div className="canvasContainer">
      <Canvas>
        <Scene />
      </Canvas>
    </div>
  );
};

export default App;
