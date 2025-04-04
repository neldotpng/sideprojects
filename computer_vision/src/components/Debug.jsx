import { OrbitControls } from "@react-three/drei";
import { Perf } from "r3f-perf";
import { useControls } from "leva";

const Debug = ({ show = false }) => {
  const { enableOrbitControls } = useControls({ enableOrbitControls: true });

  return (
    show && (
      <>
        <Perf position="top-left" />
        {enableOrbitControls ? <OrbitControls /> : null}
      </>
    )
  );
};

export default Debug;
