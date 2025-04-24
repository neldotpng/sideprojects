import { useRef } from "react";
import { Canvas } from "@react-three/fiber";

import Scene from "@/components/three/Scene";
import Scroller from "@/components/html/Scroller";

const App = () => {
  const scroller = useRef();
  const lenis = useRef();

  return (
    <>
      <div style={{ width: "100vw", height: "100vh" }}>
        <Canvas
          eventSource={scroller}
          eventPrefix="client">
          <Scene
            scroller={scroller}
            lenis={lenis}
          />
        </Canvas>
      </div>
      <Scroller
        wrapperRef={scroller}
        lenisRef={lenis}
        sections={[500, 300]}
      />
    </>
  );
};

export default App;
