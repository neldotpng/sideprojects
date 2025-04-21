import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import Debug from "./components/Debug";
import PingPongScene from "./components/PingPongScene";
import { Leva } from "leva";

const App = () => {
  const [files, setFiles] = useState([]);
  const [hideLeva, setHideLeva] = useState(true);

  useEffect(() => {
    if (files.length) setHideLeva(false);
  }, [files]);

  function processFiles(fs = []) {
    const newFiles = fs.filter((file) => file.type.includes("audio"));
    const arr = [...files, ...newFiles];

    if (fs.length !== 0 && newFiles.length === 0) {
      window.alert("Only audio files can be processed.");
    }

    if (arr.length !== files.length) {
      setFiles(arr);
    }
  }

  function onChange(e) {
    processFiles([...e.target.files]);
  }

  function onDrop(ev) {
    ev.preventDefault();
    processFiles([...ev.dataTransfer.files]);
  }

  function onDragOver(e) {
    e.preventDefault();
  }

  return (
    <main id="canvas-container">
      <Leva
        flat
        hidden={hideLeva}
      />

      <div
        className="dropzone"
        onDrop={onDrop}
        onDragOver={onDragOver}
        style={{ display: hideLeva ? "flex" : "none" }}>
        <div>Drag and Drop Files</div>
        <div>
          <label
            className="fileSelectButton"
            htmlFor="file">
            Add Songs
          </label>
          <input
            className="fileSelect"
            id="file"
            type="file"
            onChange={onChange}
            multiple
            accept="audio/*"
            title=""
          />
        </div>
      </div>

      <Canvas>
        <Debug />

        <PingPongScene files={files} />
      </Canvas>
    </main>
  );
};

export default App;
