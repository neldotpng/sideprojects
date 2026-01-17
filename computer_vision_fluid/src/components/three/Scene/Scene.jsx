import { useEffect } from "react";

import Debug from "@/global/Debug";
// import FBOPlane from "@/components/three/FBOPlane/FBOPlane";
import Grass from "../Grass/Grass";
import useFluidBuffer from "@/global/hooks/useFluidBuffer";
import useGestureControls from "@/global/hooks/useGestureControls";

import { useGestureControlsStore } from "@/global/Stores";

const Scene = () => {
  const { velocity } = useFluidBuffer();

  const [startStream, gestureControlsDataRef] = useGestureControls();

  // Init GestureControlsStore
  useEffect(() => {
    useGestureControlsStore.setState({ gestureControlsData: gestureControlsDataRef });
  }, [gestureControlsDataRef]);

  return (
    <>
      <Debug />

      <Grass fluidTexture={velocity.texture} />

      {/* <FBOPlane texture={velocity.texture} /> */}
    </>
  );
};

export default Scene;
