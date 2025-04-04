import { useEffect, useRef, useState } from "react";
import { GestureRecognizer, FilesetResolver, DrawingUtils } from "@mediapipe/tasks-vision";
import "../styles/GestureControls.css";

const GestureControls = ({
  onOpenPalm = () => {},
  onClosedFist = () => {},
  onThumbUp = () => {},
  onThumbDown = () => {},
  onVictory = () => {},
  onPointUp = () => {},
  onNone = () => {},
  sendHandData = () => {},
  numHands = 2,
  debug = false,
}) => {
  // GestureRecognizer Options
  const options = {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    // Max Number of Hands to Track
    numHands: numHands,
  };

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

  // Video Streaming Boolean
  const [streamRunning, setStreamRunning] = useState(false);

  // State management for each hand's gesture
  const [leftGesture, setLeftGesture] = useState(gestures["None"]);
  const [rightGesture, setRightGesture] = useState(gestures["None"]);

  // Debug Info State ** MAYBE REMOVE **
  // const [debugInfo, setDebugInfo] = useState({});

  // Webcam Stream Ref
  const video = useRef();

  // Debug Canvas Refs
  const canvas = useRef();
  const ctx = useRef();
  const drawingUtils = useRef();

  let gestureRecognizer = undefined;
  let lastVideoTime = -1;
  let results = undefined;

  // Resize Function
  const onResize = () => {
    // Set Canvas dimensions
    canvas.current.style.width = video.current.offsetWidth;
    canvas.current.style.height = video.current.offsetHeight;
    canvas.current.width = video.current.offsetWidth;
    canvas.current.height = video.current.offsetHeight;
  };

  // Load and create GestureRecognizing Task Model
  const createGestureRecognizer = async (callback) => {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    );

    gestureRecognizer = await GestureRecognizer.createFromOptions(vision, options);
    callback();
  };

  const startStream = () => {
    // Only Run if !streamRunning
    if (streamRunning) return;

    const constraints = {
      video: true,
      facingMode: "user",
    };

    // Start video stream via camera and
    // Start predictWebcam once stream loaded
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      video.current.srcObject = stream;
      video.current.addEventListener("loadeddata", predictWebcam);
    });

    // Update streamRunning state
    setStreamRunning(true);
  };

  // Run createGestureRecognizer and start stream on render
  // Create Canvas Context
  useEffect(() => {
    createGestureRecognizer(startStream);

    // Draw wirefram hands on Canvas if debug mode on
    if (debug) {
      ctx.current = canvas.current.getContext("2d");
      drawingUtils.current = new DrawingUtils(ctx.current);

      // Run once on init
      onResize();

      // Add Event listener for subsequent resizes
      window.addEventListener("resize", onResize);
    }

    // Remove Event Listener
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Run Gesture Functions when Gesture Updates
  useEffect(() => {
    leftGesture.fn();
  }, [leftGesture]);

  useEffect(() => {
    rightGesture.fn();
  }, [rightGesture]);

  // Match Gesture Function
  const matchGesture = (gestureName, handedness) => {
    const gesture = gestures[gestureName];
    if (handedness === "Left") {
      setLeftGesture(gesture);
    } else if (handedness === "Right") {
      setRightGesture(gesture);
    }
  };

  // Send Hand Data to parent via sendHandData
  const onHandMove = (data = { handedness: null, gestureName: "None", pos: [0, 0, 0] }) => {
    sendHandData(data);
  };

  const calcAverageLandmarkPos = (arr, objKey, mult = 1) => {
    const avg = Math.abs(arr.reduce((acc, cur) => acc + cur[objKey], 0) / arr.length) * mult;
    return Math.max(1 - avg, 0);
  };

  const predictWebcam = () => {
    // Data Variables
    let x, y, z, handedness, gestureName;

    // Update video stream by time
    let startTimeMs = performance.now();
    if (lastVideoTime !== video.current.currentTime) {
      lastVideoTime = video.current.currentTime;
      results = gestureRecognizer.recognizeForVideo(video.current, startTimeMs);
    }

    // if Debug Mode enabled clear canvas when hands not in frame
    if (debug) ctx.current.clearRect(0, 0, canvas.current.width, canvas.current.height);

    // Loop through landmarks to get approximate hand position in the window
    if (results.landmarks) {
      results.landmarks.forEach((landmarks, index) => {
        x = calcAverageLandmarkPos(landmarks, "x");
        y = calcAverageLandmarkPos(landmarks, "y");
        z = calcAverageLandmarkPos(landmarks, "z", 10);
        handedness = results.handedness[index][0].displayName;

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

    // Read the current gesture
    if (results.gestures) {
      results.gestures.forEach((items) => {
        const gesture = items[0];
        gestureName = gesture.categoryName;
        matchGesture(gestureName, handedness);
      });
    }

    // Only send data if a hand is visible
    if (results.landmarks.length && results.gestures.length) {
      onHandMove({ handedness, gestureName, pos: [x, y, z] });
    }

    window.requestAnimationFrame(predictWebcam);
  };

  return (
    <div className="gestureControls">
      <video
        autoPlay
        playsInline
        id="webcam"
        ref={video}
      />
      {debug && (
        <canvas
          className="videoCanvas"
          ref={canvas}
        />
      )}
    </div>
  );
};

export default GestureControls;
