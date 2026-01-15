import { useCallback, useEffect, useRef, useState } from "react";
import { DrawingUtils } from "@mediapipe/tasks-vision";
import { useControls } from "leva";
import { Vector2 } from "three";
import { useFrame } from "@react-three/fiber";

// Web Worker Init
const worker = window.Worker
  ? new Worker(new URL("./gesture.worker.js", import.meta.url))
  : console.error("Your browser does not support WebWorkers.");

const useGestureControls = (numHands = 2) => {
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

  // GestureRecognition Task Results
  const _results = useRef();

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

  // Setup HTML Element Attributes on mount
  useEffect(() => {
    const videoEl = video.current;
    const canvasEl = canvas.current;
    const { innerWidth, innerHeight } = window;

    // VIDEO ATTRIBUTES
    videoEl.playsInline = true;
    videoEl.autoplay = true;

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
    const results = _results.current;

    if (!results) {
      return;
    }
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

  const onFrame = useCallback((now, metadata) => {
    createImageBitmap(video.current).then((bitmap) => {
      worker.postMessage(
        { type: "frame", bitmap, timestamp: metadata.mediaTime },
        [bitmap] // transfer ownership
      );
    });

    // Start Loop
    video.current.requestVideoFrameCallback(onFrame);
  }, []);

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

        video.current.requestVideoFrameCallback(onFrame);
        worker.onmessage = (e) => {
          _results.current = e.data.result;
        };
      });
    });

    setStreamInit(true);
  }, [streamInit, onFrame]);

  useEffect(() => {
    const canvasEl = canvas.current;
    const root = document.querySelector("#root");

    // Append HTML Element
    root.appendChild(canvasEl);

    return () => {
      root.removeChild(canvasEl);
    };
  }, [enableDebug, predictWebcam, streamRunning]);

  useFrame(() => {
    if (streamRunning) predictWebcam();
  });

  useEffect(() => {
    window.addEventListener("click", startStream);

    return () => window.removeEventListener("click", startStream);
  }, [startStream]);

  return [startStream, gestureControlsData];
};

export default useGestureControls;
