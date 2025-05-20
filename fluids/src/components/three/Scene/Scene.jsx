import { useEffect } from "react";

import Debug from "@/global/Debug";
import useFluidBuffer from "@/global/hooks/useFluidBuffer";
import FBOPlane from "@/components/three/FBOPlane/FBOPlane";

import { useMouseStore } from "@/global/Stores";
import useMouse from "@/global/hooks/useMouse";

const Scene = () => {
  const bufferScene = useFluidBuffer();
  const mouseDataRef = useMouse();

  // Init MouseStore
  useEffect(() => {
    useMouseStore.setState({ mouseData: mouseDataRef });
  }, [mouseDataRef]);

  return (
    <>
      <Debug />
      <FBOPlane
        segments={2}
        texture={bufferScene.texture}
      />
    </>
  );
};

export default Scene;
