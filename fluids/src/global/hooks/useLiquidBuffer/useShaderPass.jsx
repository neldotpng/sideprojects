import { useThree, useFrame } from "@react-three/fiber";
import { useMemo, useEffect, useRef } from "react";
import { OrthographicCamera, PlaneGeometry, Scene, ShaderMaterial, Mesh } from "three";

import outputVert from "./shaders/output.vert?raw";

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
  const scene = useMemo(() => new Scene(), []);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: outputVert,
        fragmentShader: fragmentShader,
        uniforms,
      }),
    [fragmentShader, uniforms]
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
    let _fbo = fbo;
    for (let i = 0; i < iterations; i++) {
      if (shouldSwap) {
        _fbo = buffer.current ? fbo : swapFBO;
        material.uniforms[uniformToUpdate].value = buffer.current ? swapFBO.texture : fbo.texture;
      }

      gl.setRenderTarget(_fbo);
      gl.render(scene, camera);
      gl.setRenderTarget(null);

      if (shouldSwap) {
        buffer.current = !buffer.current;
        textureRef.current = buffer.current ? fbo.texture : swapFBO.texture;
      }
    }
  });

  return textureRef;
};

export default useShaderPass;
