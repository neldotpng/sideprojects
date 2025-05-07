import { useRef } from "react";
import { Canvas } from "@react-three/fiber";

import ScrollingScene from "@/components/three/ScrollingScene/ScrollingScene";
import Scroller from "@/components/dom/Scroller/Scroller";

const ScrollingApp = () => {
  const scrollerRef = useRef();
  const lenisRef = useRef();

  return (
    <>
      <div className="canvasContainer">
        <Canvas
          eventSource={scrollerRef}
          eventPrefix="client">
          <ScrollingScene
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

export default ScrollingApp;
