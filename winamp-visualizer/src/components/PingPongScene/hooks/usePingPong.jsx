import { useEffect, useRef, useMemo, useLayoutEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const usePingPong = (vertexShader = "", fragmentShader = "") => {
  const { gl, size } = useThree();
  const bufferScene = useMemo(() => new THREE.Scene(), []);
  const bufferCamera = useMemo(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), []);
  const buffer = useRef(true);

  // Settings for WebGL Renderer
  useLayoutEffect(() => {
    gl.autoClear = false;
    gl.autoClearColor = false;
  }, [gl]);

  // Ping-Pong RenderTargets, init once on load
  const [renderTargetA, renderTargetB] = useMemo(() => {
    const options = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      depthBuffer: false,
      stencilBuffer: false,
    };

    return [new THREE.WebGLRenderTarget(1, 1, options), new THREE.WebGLRenderTarget(1, 1, options)];
  }, []);

  // Hook to window resize updates, update RenderTarget sizes
  useLayoutEffect(() => {
    renderTargetA.setSize(size.width, size.height);
    renderTargetB.setSize(size.width, size.height);
  }, [size, renderTargetA, renderTargetB]);

  // Material for the bufferMesh
  const bufferMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uTexture: { value: null },
          uTextureB: { value: null },
        },
        vertexShader,
        fragmentShader,
      }),
    [vertexShader, fragmentShader]
  );

  // Create Texture
  const texture = useMemo(() => {
    return buffer.current ? renderTargetB.texture : renderTargetA.texture;
  }, [renderTargetA, renderTargetB]);

  // Create the bufferMesh
  const bufferMesh = useMemo(() => {
    const plane = new THREE.PlaneGeometry(2, 2);
    return new THREE.Mesh(plane, bufferMaterial);
  }, [bufferMaterial]);

  useEffect(() => {
    bufferScene.add(bufferMesh);
    return () => bufferScene.remove(bufferMesh);
  }, [bufferScene, bufferMesh]);

  useFrame((state, delta) => {
    // Update Uniforms
    bufferMaterial.uniforms.uTime.value += delta;

    // Ping-Pong Buffering
    const input = buffer.current ? renderTargetA : renderTargetB;
    const output = buffer.current ? renderTargetB : renderTargetA;
    bufferMaterial.uniforms.uTexture.value = input.texture;

    // Update RenderTarget and render to bufferScene
    // Then, update RT to render R3F main scene
    gl.setRenderTarget(output);
    gl.render(bufferScene, bufferCamera);
    gl.setRenderTarget(null);

    // Swap RenderTargets
    buffer.current = !buffer.current;
  });

  // Expose Texture and bufferMaterial for editing
  return [texture, bufferMaterial];
};

export default usePingPong;
