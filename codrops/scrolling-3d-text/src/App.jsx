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
        sections={[500]}
      />
    </>
  );
};

export default App;
