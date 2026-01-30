import { useCallback, useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { DrawingUtils } from "@mediapipe/tasks-vision";
import { useControls } from "leva";
import { Vector2 } from "three";

// Web Worker Init
const worker = window.Worker
  ? new Worker(new URL("./gesture.worker.js", import.meta.url))
  : console.error("Your browser does not support WebWorkers.");

const NUM_HANDS = 2;

const useGestureControls = () => {
  // Leva Controls for Debug
  const { enableDebug } = useControls({
    enableDebug: { value: false, label: "Show Finger Markers" },
  });

  const { size, viewport } = useThree();

  // State Management for Video Stream
  const [streamRunning, setStreamRunning] = useState(false);
  const [streamInit, setStreamInit] = useState(false);

  // Webcam Stream Ref
  const video = useRef(window.document.createElement("video"));
  const workerBusy = useRef(false);

  // Debug Canvas Refs
  const canvas = useRef(window.document.createElement("canvas"));
  const ctx = useRef(canvas.current.getContext("2d"));
  const drawingUtils = useRef(new DrawingUtils(ctx.current));

  // GestureRecognition Task Results
  const _results = useRef();

  // Velocity Management Ref
  const gestureControlsData = useRef(
    [...Array(NUM_HANDS)].map(() => ({
      lastActiveTime: 0,
      fingers: [...Array(5)].map(() => ({
        lastPosition: new Vector2(),
        position: new Vector2(),
        delta: new Vector2(),
      })),
    }))
  );

  // Setup HTML Element Attributes on mount
  useEffect(() => {
    const videoEl = video.current;
    const canvasEl = canvas.current;
    const { innerWidth, innerHeight, devicePixelRatio } = window;

    // VIDEO ATTRIBUTES
    videoEl.playsInline = true;
    videoEl.autoplay = true;

    // CANVAS ATTRIBUTES
    canvasEl.width = innerWidth * devicePixelRatio;
    canvasEl.height = innerHeight * devicePixelRatio;
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

  useEffect(() => {
    const canvasEl = canvas.current;
    const { width, height } = size;
    const { dpr } = viewport;

    canvasEl.width = width * dpr;
    canvasEl.height = height * dpr;
    canvasEl.style.width = `${width}px`;
    canvasEl.style.height = `${height}px`;
  }, [size, viewport]);

  // Debug Function
  // Draws landmarks to canvas
  const drawLandmarks = useCallback((landmarks) => {
    // If Debug Mode enabled draw wireframes for hand tracking
    if (drawingUtils.current) {
      // https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker#models
      drawingUtils.current.drawLandmarks(landmarks, {
        color: `rgba(255, 153, 0, 1)`,
        lineWidth: 10,
      });
    }
  }, []);

  const resetHand = useCallback((hand) => {
    hand.fingers.forEach((finger) => {
      finger.position.set(0, 0);
      finger.delta.set(0, 0);
      finger.lastPosition.set(0, 0);
    });
  }, []);

  const predictWebcam = useCallback(() => {
    const results = _results.current;
    const currentTime = Date.now();

    if (!results) {
      return;
    }

    // if debug enabled clear canvas when hands not in frame
    if (enableDebug) {
      ctx.current.clearRect(0, 0, canvas.current.width, canvas.current.height);
    }

    if (results.landmarks.length > 0) {
      // Loop through landmarks to get approximate hand position in the window
      gestureControlsData.current.forEach((_, i) => {
        const handedness = results.handedness[i] ? results.handedness[i][0].index : null;
        const fingers = results.landmarks[i]
          ? [
              results.landmarks[i][4], // Thumb = 0
              results.landmarks[i][8], // Index = 1
              results.landmarks[i][12], // Middle = 2
              results.landmarks[i][16], // Ring = 3
              results.landmarks[i][20], // Pinky = 4
            ]
          : null;

        if (handedness !== null) {
          const hand = gestureControlsData.current[handedness];

          hand.fingers.forEach((finger, j) => {
            const landmark = fingers[j];

            // Finger Screen Position X-Y
            finger.position
              .set(landmark.x, landmark.y)
              .subScalar(0.5)
              .multiplyScalar(-2)
              .clampScalar(-1, 1);

            // Check for lastPosition, if reset to 0, don't update delta till next frame
            if (finger.lastPosition.x !== 0 && finger.lastPosition.y !== 0) {
              finger.delta.subVectors(finger.position, finger.lastPosition).clampScalar(-0.5, 0.5);
            }

            finger.lastPosition.copy(finger.position);
          });

          // Set lastActiveTime
          hand.lastActiveTime = currentTime;
        } else {
          // handle out of frame hand when just 1 hand in frame
          const oofHand = Math.abs(results.handedness[0][0].index - 1);
          // Build in delay check to see if hand really out of frame or hand recognition is lagging ~200ms
          if (gestureControlsData.current[oofHand].lastActiveTime - currentTime <= -100) {
            resetHand(gestureControlsData.current[oofHand]);
          }
        }

        if (enableDebug) {
          drawLandmarks(fingers); // If hands are in frame and debug enabled, draw landmarks to canvas
        }
      });
    } else {
      // Handle no hands in frame
      // If no results recorded, zero out both hands
      gestureControlsData.current.forEach((hand) => {
        if (hand.lastActiveTime - currentTime <= -100) {
          resetHand(hand);
        }
      });
    }
  }, [enableDebug, drawLandmarks, resetHand]);

  const onFrame = useCallback((now, metadata) => {
    // If worker is processing a frame, skip bitmap generation
    if (!workerBusy.current) {
      // generate bitmap and post to worker
      createImageBitmap(video.current).then((bitmap) => {
        workerBusy.current = true;

        worker.postMessage(
          { type: "frame", bitmap, timestamp: metadata.mediaTime },
          [bitmap] // transfer ownership
        );
      });
    }

    // Start Loop
    video.current.requestVideoFrameCallback(onFrame);
  }, []);

  const startStream = useCallback(() => {
    if (streamInit) return;

    // Initialize worker with max NUM_HANDS
    worker.postMessage({ type: "init", numHands: NUM_HANDS });

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

        // Read worker results
        worker.onmessage = (e) => {
          workerBusy.current = false; // after worker posts results, allow generation of next bitmap
          _results.current = e.data.result; // copy results to ref
        };
      });
    });

    setStreamInit(true);
  }, [streamInit, onFrame]);

  useEffect(() => {
    const canvasEl = canvas.current;
    const root = document.querySelector("#root");

    // Append HTML Element
    if (enableDebug) root.appendChild(canvasEl);

    return () => {
      if (enableDebug) root.removeChild(canvasEl);
    };
  }, [enableDebug, predictWebcam, streamRunning]);

  useFrame(() => {
    if (streamRunning) predictWebcam();
  });

  return [startStream, gestureControlsData];
};

export default useGestureControls;
