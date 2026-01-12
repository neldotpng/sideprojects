import { useCallback, useEffect, useRef, useState } from "react";
import { GestureRecognizer, FilesetResolver, DrawingUtils } from "@mediapipe/tasks-vision";
import cx from "./GestureControls.module.scss";

// GestureRecognizer Options
const options = {
  baseOptions: {
    modelAssetPath:
      "https://storage.googleapis.com/mediapipe-tasks/gesture_recognizer/gesture_recognizer.task",
    delegate: "GPU",
  },
  runningMode: "VIDEO",
  // Max Number of Hands to Track
  numHands: 2,
};

const GestureControls = ({
  onOpenPalm = () => {},
  onClosedFist = () => {},
  onThumbUp = () => {},
  onThumbDown = () => {},
  onVictory = () => {},
  onPointUp = () => {},
  onNone = () => {},
  sendHandData = () => {},
  debug = false,
}) => {
  // Gestures Constant
  // https://ai.google.dev/edge/mediapipe/solutions/vision/gesture_recognizer/web_js#configuration_options
  const gestures = {
    Open_Palm: {
      name: "Open_Palm",
      fn: onOpenPalm,
    },
    Closed_Fist: {
      name: "Closed_Fist",
      fn: onClosedFist,
    },
    Thumb_Up: {
      name: "Thumb_Up",
      fn: onThumbUp,
    },
    Thumb_Down: {
      name: "Thumb_Down",
      fn: onThumbDown,
    },
    Victory: {
      name: "Victory",
      fn: onVictory,
    },
    Pointing_Up: {
      name: "Pointing_Up",
      fn: onPointUp,
    },
    None: {
      name: "None",
      fn: onNone,
    },
  };

  // // State management for each hand's gesture
  // const [leftGesture, setLeftGesture] = useState(gestures["None"]);
  // const [rightGesture, setRightGesture] = useState(gestures["None"]);

  // Debug Info State ** MAYBE REMOVE **
  // const [debugInfo, setDebugInfo] = useState({});

  // Webcam Stream Ref
  const video = useRef();

  // Debug Canvas Refs
  const canvas = useRef();
  const ctx = useRef();
  const drawingUtils = useRef();

  const gestureRecognizer = useRef();
  const lastVideoTime = useRef(-1);

  // Resize Function
  const onResize = () => {
    // Set Canvas dimensions
    canvas.current.style.width = video.current.offsetWidth;
    canvas.current.style.height = video.current.offsetHeight;
    canvas.current.width = video.current.offsetWidth;
    canvas.current.height = video.current.offsetHeight;
  };

  // Run createGestureRecognizer
  useEffect(() => {
    // Load and create GestureRecognizing Task Model
    const createGestureRecognizer = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
      );

      gestureRecognizer.current = await GestureRecognizer.createFromOptions(vision, options);
    };

    createGestureRecognizer();
  }, []);

  const predictWebcam = useCallback(() => {
    if (!gestureRecognizer.current) {
      window.requestAnimationFrame(predictWebcam);
      return;
    }

    // Update video stream by time
    let startTimeMs = performance.now();
    let results;
    if (lastVideoTime !== video.current.currentTime) {
      console.log(gestureRecognizer.current);
      results = gestureRecognizer.current?.recognizeForVideo(video.current, startTimeMs);
      lastVideoTime.current = video.current.currentTime;
    }

    // if Debug Mode enabled clear canvas when hands not in frame
    if (debug) ctx.current.clearRect(0, 0, canvas.current.width, canvas.current.height);

    // Loop through landmarks to get approximate hand position in the window
    if (results.landmarks) {
      results.landmarks.forEach((landmarks) => {
        // If Debug Mode enabled draw wireframes for hand tracking
        if (debug) {
          // Draw Connecting lines between landmarks
          drawingUtils.current.drawConnectors(landmarks, GestureRecognizer.HAND_CONNECTIONS, {
            color: "#ff00ff",
            lineWidth: 5,
          });
          // Draw landmarks
          // https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker#models
          drawingUtils.current.drawLandmarks(landmarks, {
            color: "#ffff00",
            lineWidth: 2,
          });
        }
      });
    }

    // // Only send data if a hand is visible
    // if (results.landmarks.length && results.gestures.length) {
    //   console.log("test");
    //   onHandMove({ handedness, gestureName, pos: [x, y, z] });
    // }

    window.requestAnimationFrame(predictWebcam);
  }, [debug]);

  const startStream = useCallback(() => {
    const constraints = {
      video: true,
      facingMode: "user",
    };

    // Start video stream via camera and
    // Start predictWebcam once stream loaded
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      video.current.srcObject = stream;
      video.current.addEventListener("loadeddata", () => {
        if (debug) {
          ctx.current = canvas.current.getContext("2d");
          drawingUtils.current = new DrawingUtils(ctx.current);
          onResize();
        }
        predictWebcam();
      });
    });
  }, [debug, predictWebcam]);

  useEffect(() => {
    window.addEventListener("click", startStream);

    return () => window.removeEventListener("click", startStream);
  }, [startStream]);

  // // Send Hand Data to parent via sendHandData
  // const onHandMove = (data = { handedness: null, gestureName: "None", pos: [0, 0, 0] }) => {
  //   sendHandData(data);
  // };

  return (
    <div className={cx.controls}>
      <video
        autoPlay
        playsInline
        id="webcam"
        className={cx.webcam}
        ref={video}
      />
      {debug && (
        <canvas
          className={cx.canvas}
          ref={canvas}
        />
      )}
    </div>
  );
};

export default GestureControls;
