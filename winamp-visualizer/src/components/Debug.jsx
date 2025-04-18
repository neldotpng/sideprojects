import { OrbitControls } from "@react-three/drei";
import { Perf } from "r3f-perf";
import { useControls, folder } from "leva";

const Debug = () => {
  const { enableOrbitControls, enablePerf } = useControls({
    "Debug Tools": folder(
      {
        enableOrbitControls: false,
        enablePerf: true,
      },
      { collapsed: true }
    ),
  });

  return (
    <>
      <Perf
        position="top-left"
        style={{ display: enablePerf ? "block" : "none" }}
      />
      {enableOrbitControls ? <OrbitControls /> : null}
    </>
  );
};

export default Debug;
