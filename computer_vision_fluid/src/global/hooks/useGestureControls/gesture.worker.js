self.importScripts("./mediapipe/vision_bundle.js");

const options = {
  baseOptions: {
    modelAssetPath: "./mediapipe/gesture_recognizer.task",
    delegate: "GPU",
  },
  runningMode: "IMAGE",
  // Max Number of Hands to Track
  numHands: 2,
};

// Load and create GestureRecognizing Task Model
const createGestureRecognizer = async () => {
  // _mediapipe const included in importScript
  // ignore error
  const vision = await _mediapipe.FilesetResolver.forVisionTasks("./mediapipe/wasm");

  return _mediapipe.GestureRecognizer.createFromOptions(vision, options);
};

const gestureRecognizer = createGestureRecognizer();

self.onmessage = async (e) => {
  if (e.data.type === "frame") {
    const { bitmap, timestamp } = e.data;

    const result = await gestureRecognizer.then((gr) => {
      return gr.recognize(bitmap);
    });

    bitmap.close(); // free GPU memory ASAP

    self.postMessage({
      type: "result",
      result,
      timestamp,
    });
  }
};
