import { Canvas } from "@react-three/fiber";
import Scene from "@/components/three/Scene/Scene";
import useGestureControls from "@/global/hooks/useGestureControls";

const App = () => {
  useGestureControls();

  return (
    <>
      <div className="canvasContainer">
        <Canvas>
          <Scene />
        </Canvas>
      </div>
    </>
  );
};

export default App;
