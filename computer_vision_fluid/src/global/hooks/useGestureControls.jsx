import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GestureRecognizer, FilesetResolver, DrawingUtils } from "@mediapipe/tasks-vision";
import { useControls } from "leva";
import { Vector2 } from "three";

const useGestureControls = (numHands = 2) => {
  // GestureRecognizer Options
  const options = useMemo(
    () => ({
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-tasks/gesture_recognizer/gesture_recognizer.task",
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      // Max Number of Hands to Track
      numHands: numHands,
    }),
    [numHands]
  );

  // Leva Controls for Debug
  const { enableDebug } = useControls({ enableDebug: true });

  // State Management for Video Stream
  const [streamRunning, setStreamRunning] = useState(false);
  const [streamInit, setStreamInit] = useState(false);

  // Webcam Stream Ref
  const video = useRef(window.document.createElement("video"));

  // Debug Canvas Refs
  const canvas = useRef(window.document.createElement("canvas"));
  const ctx = useRef(canvas.current.getContext("2d"));
  const drawingUtils = useRef(new DrawingUtils(ctx.current));

  // GestureRecognition Task
  const gestureRecognizer = useRef();

  // Velocity Management Ref
  const gestureControlsData = useRef(
    [...Array(numHands)].map(() =>
      [...Array(5)].map(() => ({
        lastPosition: new Vector2(),
        position: new Vector2(),
        delta: new Vector2(),
      }))
    )
  );

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
  }, [options]);

  // Setup HTML Element Attributes on mount
  useEffect(() => {
    const videoEl = video.current;
    const canvasEl = canvas.current;
    const { innerWidth, innerHeight } = window;

    // VIDEO ATTRIBUTES
    videoEl.playsInline = true;
    videoEl.autoplay = true;
    videoEl.style.cssText = `
      visibility: hidden;
      position: absolute;
      left: -9999px;
      height: 360px;
    `;

    // CANVAS ATTRIBUTES
    // TOFIX: HANDLE CANVAS RESIZE
    canvasEl.width = innerWidth;
    canvasEl.height = innerHeight;
    canvasEl.style.cssText = `
      width: ${innerWidth}px;
      height: ${innerHeight}px;
      transform: rotateY(180deg);
      position: fixed;
      top: 0;
      left: 0;
      pointer-events: none;
    `;
  }, []);

  // Debug Function
  // Draws landmarks to canvas
  const drawLandmarks = useCallback((landmarks) => {
    // If Debug Mode enabled draw wireframes for hand tracking
    if (drawingUtils.current) {
      // https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker#models
      drawingUtils.current.drawLandmarks(landmarks, {
        color: `rgba(255, 153, 0, 1)`,
        lineWidth: 2,
      });
    }
  }, []);

  const predictWebcam = useCallback(() => {
    if (!gestureRecognizer.current || !video.current) {
      return;
    }

    // Update video stream by time
    const results = gestureRecognizer.current.recognizeForVideo(video.current, performance.now());

    // if Debug Mode enabled clear canvas when hands not in frame
    if (enableDebug) {
      ctx.current.clearRect(0, 0, canvas.current.width, canvas.current.height);
    }

    // if hands recognized, pass landmarks to fingertips array
    if (results && results.landmarks.length > 0) {
      // Loop through landmarks to get approximate hand position in the window
      results.landmarks.forEach((handLandmarks, i) => {
        const fingers = [
          // handLandmarks[4], // Thumb = 0
          handLandmarks[8], // Index = 1
          // handLandmarks[12], // Middle = 2
          // handLandmarks[16], // Ring = 3
          // handLandmarks[20], // Pinky = 4
        ];

        fingers.forEach((landmark, j) => {
          const fingerData = gestureControlsData.current[i][j];

          fingerData.position
            .set(landmark.x, landmark.y)
            .subScalar(0.5)
            .multiplyScalar(-2)
            .clampScalar(-1, 1);
          fingerData.delta
            .subVectors(fingerData.position, fingerData.lastPosition)
            .clampScalar(-1, 1);

          fingerData.lastPosition.copy(fingerData.position);
        });

        if (enableDebug) {
          // If hands are in frame, draw landmarks to canvas
          drawLandmarks(fingers);
        }
      });
    } else {
      gestureControlsData.current.forEach((hand) => {
        hand.forEach((finger) => {
          finger.position.set(0, 0);
          finger.delta.set(0, 0);
        });
      });
    }
  }, [enableDebug, drawLandmarks]);

  const startStream = useCallback(() => {
    if (streamInit) return;

    const constraints = {
      video: true,
      facingMode: "user",
    };

    // Start video stream via camera and
    // Start predictWebcam once stream loaded
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      video.current.srcObject = stream;
      video.current.addEventListener("loadeddata", () => {
        setStreamRunning(true);
      });
    });

    setStreamInit(true);
  }, [streamInit]);

  useEffect(() => {
    let rafID;
    const videoEl = video.current;
    const canvasEl = canvas.current;
    const root = document.querySelector("#root");

    // Define Animation Loop and set rAFID
    const startPrediction = () => {
      predictWebcam();
      rafID = requestAnimationFrame(startPrediction);
    };

    // Append HTML Elements
    root.appendChild(videoEl);
    root.appendChild(canvasEl);

    // If stream has loaded, start gesture prediction
    if (streamRunning) {
      startPrediction();
    }

    return () => {
      root.removeChild(videoEl);
      root.removeChild(canvasEl);

      cancelAnimationFrame(rafID);
    };
  }, [enableDebug, predictWebcam, streamRunning]);

  useEffect(() => {
    window.addEventListener("click", startStream);

    return () => window.removeEventListener("click", startStream);
  }, [startStream]);

  return [startStream, gestureControlsData];
};

export default useGestureControls;
