import { Canvas } from "@react-three/fiber";
import GestureControls from "./components/GestureControls";
import Debug from "./components/Debug";
import Test from "./components/Test";
import { useState } from "react";

const App = () => {
  // const [gesture, setGesture] = useState();
  const [leftHandData, setLeftHandData] = useState({});
  const [rightHandData, setRightHandData] = useState({});

  const onOpenPalm = () => {
    // setGesture("Open_Palm");
  };

  const onClosedFist = () => {
    // setGesture("Closed_Fist");
  };

  // useEffect(() => {
  //   console.log(gesture);
  // }, [gesture]);

  const getHandData = (data) => {
    // console.log(gesture);
    // if (gesture === "Closed_Fist") {
    if (data.handedness === "Left") setLeftHandData(data);
    if (data.handedness === "Right") setRightHandData(data);
    // }
  };

  return (
    <main id="canvas-container">
      <GestureControls
        debug
        onOpenPalm={onOpenPalm}
        onClosedFist={onClosedFist}
        sendHandData={getHandData}
      />
      <Canvas>
        <Debug show />

        <ambientLight intensity={0.1} />
        <directionalLight
          color="red"
          position={[0, 0, 5]}
        />

        <Test data={[leftHandData, rightHandData]} />
      </Canvas>
    </main>
  );
};

export default App;
