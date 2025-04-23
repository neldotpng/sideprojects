import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import Scene from "@/components/three/Scene";
import Scroller from "@/components/html/Scroller";

const App = () => {
  const scroller = useRef();

  return (
    <>
      <div style={{ width: "100vw", height: "100vh" }}>
        <Canvas
          eventSource={scroller}
          eventPrefix="client">
          <Scene scroller={scroller} />
        </Canvas>
      </div>
      <Scroller
        ref={scroller}
        sections={[100, 125, 150, 175, 200]}
      />
    </>
  );
};

export default App;
