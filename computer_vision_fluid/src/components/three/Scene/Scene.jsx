import { useEffect } from "react";

import Debug from "@/global/Debug";
import FBOPlane from "@/components/three/FBOPlane/FBOPlane";
import useFluidBuffer from "@/global/hooks/useFluidBuffer";

import { useGestureControlsStore } from "@/global/Stores";
import useGestureControls from "@/global/hooks/useGestureControls";

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

      <FBOPlane texture={velocity.texture} />
    </>
  );
};

export default Scene;
