import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState, useReducer } from "react";

const Test = ({ data }) => {
  const leftHand = data[0];
  const rightHand = data[1];

  const reducer = (state, action) => {
    switch (action.type) {
      case "update_left":
        return {
          ...state,
          leftHandStartingPos: leftHand.pos,
        };
      case "reset_left":
        return {
          ...state,
          leftHandStartingPos: [0, 0, 0],
        };
      case "update_right":
        return {
          ...state,
          rightHandStartingPos: rightHand.pos,
        };
      case "reset_right":
        return {
          ...state,
          rightHandStartingPos: [0, 0, 0],
        };
    }
  };

  const [state, dispatch] = useReducer(reducer, {
    leftHandStartingPos: [0, 0, 0],
    rightHandStartingPos: [0, 0, 0],
  });
  const [leftGesture, setLeftGesture] = useState("None");
  const [rightGesture, setRightGesture] = useState("None");
  const box = useRef();

  useEffect(() => {
    if (leftGesture === "Open_Palm") {
      dispatch({ type: "update_left" });
    } else if (leftGesture !== "Open_Palm") {
      dispatch({ type: "reset_left" });
    }

    if (rightGesture === "Open_Palm") {
      dispatch({ type: "update_right" });
    } else if (rightGesture !== "Open_Palm") {
      dispatch({ type: "reset_right" });
    }
  }, [leftGesture, rightGesture]);

  useFrame(() => {
    if (leftHand.gestureName === "Open_Palm") {
      setLeftGesture("Open_Palm");
      box.current.rotation.x -= (leftHand.pos[1] - state.leftHandStartingPos[1]) * 0.1;
      // box.current.rotation.z += (leftHand.pos[2] - state.startingPos[2]) * 0.1;
    } else if (rightHand.gestureName === "Open_Palm") {
      setRightGesture("Open_Palm");
      box.current.rotation.y += (rightHand.pos[0] - state.rightHandStartingPos[0]) * 0.1;
    } else {
      setLeftGesture("None");
      setRightGesture("None");
    }
  });

  return (
    <mesh ref={box}>
      <boxGeometry args={[2, 2, 2]} />
      <meshNormalMaterial />
    </mesh>
  );
};

export default Test;
