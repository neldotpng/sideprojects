import { Canvas } from "@react-three/fiber";
import Scene from "@/components/three/Scene/Scene";
import GestureControls from "./components/gestureControls/GestureControls";

const App = () => {
  return (
    <>
      <GestureControls></GestureControls>
      <div className="canvasContainer">
        <Canvas>
          <Scene />
        </Canvas>
      </div>
    </>
  );
};

export default App;
