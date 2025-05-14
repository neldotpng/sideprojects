import { useThree, useFrame } from "@react-three/fiber";
import { useMemo, useEffect, useRef } from "react";
import {
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Mesh,
  Uniform,
  Vector2,
} from "three";

import mainVert from "./shaders/main.vert?raw";

const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 1);
camera.position.z = 1;
const geometry = new PlaneGeometry(2, 2);

const useShaderPass = ({
  fragmentShader,
  uniforms,
  fbo,
  swapFBO,
  iterations = 1,
  uniformToUpdate = "uVelocity",
}) => {
  const { gl } = useThree();
  const cellScale = useMemo(() => {
    return new Vector2(1 / fbo.width, 1 / fbo.height);
  }, [fbo]);
  const scene = useMemo(() => new Scene(), []);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: mainVert,
        fragmentShader: fragmentShader,
        uniforms: {
          ...uniforms,
          uCellScale: new Uniform(cellScale),
        },
      }),
    [fragmentShader, uniforms, cellScale]
  );

  const shouldSwap = useMemo(() => swapFBO != undefined, [swapFBO]);
  const buffer = useRef(true);
  const textureRef = useRef(
    shouldSwap ? (buffer.current ? fbo.texture : swapFBO.texture) : fbo.texture
  );

  useEffect(() => {
    const mesh = new Mesh(geometry, material);
    scene.add(mesh);

    return () => {
      scene.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
    };
  }, [material, scene]);

  useFrame(() => {
    if (!shouldSwap) {
      gl.setRenderTarget(fbo);
      gl.render(scene, camera);
      gl.setRenderTarget(null);
    } else {
      let read = buffer.current ? fbo : swapFBO;
      let write = buffer.current ? swapFBO : fbo;

      for (let i = 0; i < iterations; i++) {
        // Set input texture for current iteration
        material.uniforms[uniformToUpdate].value = read.texture;

        // Set render target and render to it
        gl.setRenderTarget(write);
        gl.render(scene, camera);
        gl.setRenderTarget(null);

        // Swap read/write for next iteration
        const temp = read;
        read = write;
        write = temp;
      }

      // After final iteration, update external reference
      buffer.current = read === fbo;
      textureRef.current = read.texture;
    }
  });

  return textureRef;
};

export default useShaderPass;
