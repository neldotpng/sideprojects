self.importScripts("./mediapipe/vision_bundle.js");

let landmarker;
let _busy = false;
const options = {
  baseOptions: {
    modelAssetPath: "./mediapipe/gesture_recognizer.task",
    delegate: "GPU",
  },
  runningMode: "IMAGE",
  // Max Number of Hands to Track
  numHands: 2,
};

// Load and create Image Recognition Task Model
const createLandmarker = async () => {
  // _mediapipe const imported from importScript
  const vision = await _mediapipe.FilesetResolver.forVisionTasks("./mediapipe/wasm");

  return _mediapipe.GestureRecognizer.createFromOptions(vision, options);
};

const sendFrameData = async (data) => {
  const { bitmap, timestamp } = data;

  // Check if Frame is in process
  if (_busy) {
    bitmap.close();
    return;
  }

  // Set frame to in process
  _busy = true;

  const result = await landmarker.then((_l) => {
    return _l.recognize(bitmap);
  });

  bitmap.close(); // free GPU memory ASAP

  self.postMessage({ type: "result", result, timestamp });

  // Frame process complete
  _busy = false;
};

self.onmessage = async ({ data }) => {
  switch (data.type) {
    case "init":
      options.numHands = data.numHands;
      landmarker = createLandmarker();
      break;
    case "frame":
      sendFrameData(data);
      break;
  }
};
