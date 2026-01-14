import { useCallback, useEffect, useRef, useState } from "react";
import { GestureRecognizer, FilesetResolver, DrawingUtils } from "@mediapipe/tasks-vision";
import { useControls } from "leva";

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

const useGestureControls = () =>
  //   {
  //   onOpenPalm = () => {},
  //   onClosedFist = () => {},
  //   onThumbUp = () => {},
  //   onThumbDown = () => {},
  //   onVictory = () => {},
  //   onPointUp = () => {},
  //   onNone = () => {},
  //   sendHandData = () => {},
  //   debug = false,
  // }
  {
    const { enableDebug } = useControls({ enableDebug: true });
    // // Gestures Constant
    // // https://ai.google.dev/edge/mediapipe/solutions/vision/gesture_recognizer/web_js#configuration_options
    // const gestures = {
    //   Open_Palm: {
    //     name: "Open_Palm",
    //     fn: onOpenPalm,
    //   },
    //   Closed_Fist: {
    //     name: "Closed_Fist",
    //     fn: onClosedFist,
    //   },
    //   Thumb_Up: {
    //     name: "Thumb_Up",
    //     fn: onThumbUp,
    //   },
    //   Thumb_Down: {
    //     name: "Thumb_Down",
    //     fn: onThumbDown,
    //   },
    //   Victory: {
    //     name: "Victory",
    //     fn: onVictory,
    //   },
    //   Pointing_Up: {
    //     name: "Pointing_Up",
    //     fn: onPointUp,
    //   },
    //   None: {
    //     name: "None",
    //     fn: onNone,
    //   },
    // };

    const [streamRunning, setStreamRunning] = useState(false);

    // // State management for each hand's gesture
    // const [leftGesture, setLeftGesture] = useState(gestures["None"]);
    // const [rightGesture, setRightGesture] = useState(gestures["None"]);

    // Debug Info State ** MAYBE REMOVE **
    // const [debugInfo, setDebugInfo] = useState({});

    // Webcam Stream Ref
    const video = useRef(window.document.createElement("video"));

    // Debug Canvas Refs
    const canvas = useRef(window.document.createElement("canvas"));
    const ctx = useRef(canvas.current.getContext("2d"));
    const drawingUtils = useRef();

    const gestureRecognizer = useRef();
    const lastVideoTime = useRef(-1);

    // Resize Function
    const onResize = () => {
      // Set Canvas dimensions
      canvas.current.style.width = window.innerWidth;
      canvas.current.style.height = window.innerHeight;
      canvas.current.width = window.innerWidth;
      canvas.current.height = window.innerHeight;
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

    const calcAverageLandmarkPos = (arr, objKey) => {
      const avg = Math.abs(arr.reduce((acc, cur) => acc + cur[objKey], 0) / arr.length);
      return Math.max(1 - avg, 0);
    };

    const predictWebcam = useCallback(() => {
      if (!gestureRecognizer.current || !video.current) {
        return;
      }

      // Update video stream by time
      let startTimeMs = performance.now(),
        results,
        x,
        y;
      if (lastVideoTime !== video.current.currentTime) {
        results = gestureRecognizer.current.recognizeForVideo(video.current, startTimeMs);
        lastVideoTime.current = video.current.currentTime;
      }

      if (enableDebug) {
        // if Debug Mode enabled clear canvas when hands not in frame
        ctx.current.clearRect(0, 0, canvas.current.width, canvas.current.height);

        if (results.landmarks) {
          // Loop through landmarks to get approximate hand position in the window
          results.landmarks.forEach((landmarks, index) => {
            x = calcAverageLandmarkPos(landmarks, "x");
            y = calcAverageLandmarkPos(landmarks, "y");

            // If Debug Mode enabled draw wireframes for hand tracking
            if (drawingUtils.current) {
              // Draw Connecting lines between landmarks
              drawingUtils.current.drawConnectors(landmarks, GestureRecognizer.HAND_CONNECTIONS, {
                color: "#00c8ff",
                lineWidth: 5,
              });
              // Draw landmarks
              // https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker#models
              drawingUtils.current.drawLandmarks(
                [landmarks[4], landmarks[8], landmarks[12], landmarks[16], landmarks[20]],
                {
                  color: `rgba(255, 153, 0, 1)`,
                  lineWidth: 2,
                }
              );
            }
          });
        }
      }

      // // Only send data if a hand is visible
      // if (results.landmarks.length && results.gestures.length) {
      //   console.log("test");
      //   onHandMove({ handedness, gestureName, pos: [x, y, z] });
      // }
    }, [enableDebug]);

    const startStream = useCallback(() => {
      if (streamRunning) return;

      const constraints = {
        video: true,
        facingMode: "user",
      };

      // Start video stream via camera and
      // Start predictWebcam once stream loaded
      navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        video.current.srcObject = stream;
        video.current.addEventListener("loadeddata", () => {
          // Wait for Video to load then set up debug context
          drawingUtils.current = new DrawingUtils(ctx.current);
          onResize();
          setStreamRunning(true);
        });
      });
    }, [streamRunning]);

    useEffect(() => {
      const videoEl = video.current;
      const canvasEl = canvas.current;
      const root = document.querySelector("#root");

      // VIDEO ATTRIBUTES
      videoEl.playsInline = true;
      videoEl.autoplay = true;
      videoEl.style.visibility = "hidden";
      videoEl.style.position = "absolute";
      videoEl.style.left = "-9999px";
      root.appendChild(videoEl);

      // DEBUG CANVAS ATTRIBUTES
      if (enableDebug) {
        canvasEl.style.width = window.innerWidth;
        canvasEl.style.height = window.innerHeight;
        canvasEl.style.transform = "rotateY(180deg)";
        canvasEl.style.position = "fixed";
        canvasEl.style.top = 0;
        canvasEl.style.left = 0;
        canvasEl.style.pointerEvents = "none";
        canvasEl.width = window.innerWidth;
        canvasEl.height = window.innerHeight;
        root.appendChild(canvasEl);
      }

      let rafID;
      const startPrediction = () => {
        predictWebcam();
        rafID = requestAnimationFrame(startPrediction);
      };

      if (streamRunning) {
        startPrediction();
      }

      return () => {
        cancelAnimationFrame(rafID);
        root.removeChild(videoEl);
        if (enableDebug) root.removeChild(canvasEl);
      };
    }, [enableDebug, predictWebcam, streamRunning]);

    useEffect(() => {
      window.addEventListener("click", startStream);

      return () => window.removeEventListener("click", startStream);
    }, [startStream]);

    // // Send Hand Data to parent via sendHandData
    // const onHandMove = (data = { handedness: null, gestureName: "None", pos: [0, 0, 0] }) => {
    //   sendHandData(data);
    // };

    return;
  };

export default useGestureControls;
