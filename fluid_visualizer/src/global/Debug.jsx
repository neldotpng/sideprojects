// import { OrbitControls } from "@react-three/drei";
import { Perf } from "r3f-perf";
import { useControls } from "leva";

const Debug = () => {
  const { enablePerformance } = useControls({
    enablePerformance: { value: false, label: "Show Perf" },
  });

  return (
    <>
      {enablePerformance ? <Perf position="top-left" /> : null}
      {/* {enableOrbitControls ? <OrbitControls /> : null} */}
    </>
  );
};

export default Debug;
