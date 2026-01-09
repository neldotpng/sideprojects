import { useEffect } from "react";

import Debug from "@/global/Debug";
import FBOPlane from "@/components/three/FBOPlane/FBOPlane";
import useFluidBuffer from "@/global/hooks/useFluidBuffer";

import { useMouseStore } from "@/global/Stores";
import useMouse from "@/global/hooks/useMouse";

const Scene = () => {
  const { velocity } = useFluidBuffer();

  const mouseDataRef = useMouse();

  // Init MouseStore
  useEffect(() => {
    useMouseStore.setState({ mouseData: mouseDataRef });
  }, [mouseDataRef]);

  return (
    <>
      <Debug />

      <FBOPlane texture={velocity.texture} />
    </>
  );
};

export default Scene;
