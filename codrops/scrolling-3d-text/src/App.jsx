import { useRef } from "react";
import { Canvas } from "@react-three/fiber";

import Scene from "@/components/three/Scene/Scene";
import Scroller from "@/components/dom/Scroller/Scroller";

const App = () => {
  const scrollerRef = useRef();
  const lenisRef = useRef();

  return (
    <>
      <div style={{ width: "100vw", height: "100vh" }}>
        <Canvas
          eventSource={scrollerRef}
          eventPrefix="client">
          <Scene
            scrollerRef={scrollerRef}
            lenisRef={lenisRef}
          />
        </Canvas>
      </div>
      <Scroller
        wrapperRef={scrollerRef}
        lenisRef={lenisRef}
        sections={[500, 300]}
      />
    </>
  );
};

export default App;
