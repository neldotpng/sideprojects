import { OrbitControls } from "@react-three/drei";
import { Perf } from "r3f-perf";
import { useControls, folder } from "leva";

const Debug = () => {
  const { Stats } = useControls({
    "Debug Tools": folder({
      Stats: false,
    }),
  });

  return (
    <>
      <Perf
        position="top-left"
        style={{ display: Stats ? "block" : "none" }}
      />
    </>
  );
};

export default Debug;
