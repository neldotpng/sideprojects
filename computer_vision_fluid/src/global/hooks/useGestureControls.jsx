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

const useGestureControls = () => {
  const { enableDebug } = useControls({ enableDebug: true });

  const [streamRunning, setStreamRunning] = useState(false);

  // Webcam Stream Ref
  const video = useRef(window.document.createElement("video"));

  // Debug Canvas Refs
  const canvas = useRef(window.document.createElement("canvas"));
  const ctx = useRef(canvas.current.getContext("2d"));
  const drawingUtils = useRef(new DrawingUtils(ctx.current));

  const gestureRecognizer = useRef();

  // Debug Function
  // Draws landmarks to canvas
  const drawLandmarks = useCallback((hands) => {
    // Loop through landmarks to get approximate hand position in the window
    hands.forEach((handLandmarks) => {
      const fingertips = [
        handLandmarks[4], // Thumb
        handLandmarks[8], // Index
        handLandmarks[12], // Middle
        handLandmarks[16], // Ring
        handLandmarks[20], // Pinky
      ];

      // If Debug Mode enabled draw wireframes for hand tracking
      if (drawingUtils.current) {
        // https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker#models
        drawingUtils.current.drawLandmarks(fingertips, {
          color: `rgba(255, 153, 0, 1)`,
          lineWidth: 2,
        });
      }
    });
  }, []);

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
    if (!gestureRecognizer.current || !video.current) {
      return;
    }

    // Update video stream by time
    const results = gestureRecognizer.current.recognizeForVideo(video.current, performance.now());

    if (enableDebug) {
      // if Debug Mode enabled clear canvas when hands not in frame
      ctx.current.clearRect(0, 0, canvas.current.width, canvas.current.height);

      // If hands are in frame, draw landmarks to canvas
      if (results) {
        drawLandmarks(results.landmarks);
      }
    }
  }, [enableDebug, drawLandmarks]);

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
      canvasEl.width = window.innerWidth;
      canvasEl.height = window.innerHeight;
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

  return;
};

export default useGestureControls;
