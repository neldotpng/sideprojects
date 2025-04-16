// import { OrbitControls } from "@react-three/drei";
import { Perf } from "r3f-perf";
// import { useControls } from "leva";

const Debug = () => {
  // const { enableOrbitControls } = useControls({ enableOrbitControls: false });

  return (
    <>
      <Perf position="top-left" />
      {/* {enableOrbitControls ? <OrbitControls /> : null} */}
    </>
  );
};

export default Debug;
