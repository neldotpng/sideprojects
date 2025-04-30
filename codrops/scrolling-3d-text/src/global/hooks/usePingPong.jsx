import { useEffect, useRef, useMemo, useLayoutEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { useFBO } from "@react-three/drei";
import * as THREE from "three";

const usePingPong = ({
  segments = 2,
  vertexShader = `
    void main() {
      gl_Position = vec4(position, 1.);
    }`,
  fragmentShader = `
    void main() {
      vec3 color = vec3(0.);
      gl_FragColor = vec4(color, 1.);
    }`,
  uniforms = {},
}) => {
  const { gl, viewport } = useThree();
  const bufferScene = useMemo(() => new THREE.Scene(), []);
  const bufferCamera = useMemo(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), []);
  const buffer = useRef(true);

  // Settings for WebGL Renderer
  useLayoutEffect(() => {
    gl.autoClear = false;
    gl.autoClearColor = false;
  }, [gl]);

  const renderTargetA = useFBO({ stencilBuffer: false, depthBuffer: false });
  const renderTargetB = useFBO({ stencilBuffer: false, depthBuffer: false });

  // Material for the bufferMesh
  const bufferMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uTexture: { value: null },
          uResolution: { value: new THREE.Vector2(0, 0) },
          ...uniforms,
        },
        vertexShader,
        fragmentShader,
      }),
    [vertexShader, fragmentShader, uniforms]
  );

  // Create Texture
  const textureRef = useRef(buffer.current ? renderTargetB.texture : renderTargetA.texture);

  // Create bufferMesh and add to scene
  // Remove and dispose when material updates
  useEffect(() => {
    const plane = new THREE.PlaneGeometry(2, 2, segments, segments);
    const bufferMesh = new THREE.Mesh(plane, bufferMaterial);

    bufferScene.add(bufferMesh);
    return () => {
      bufferScene.remove(bufferMesh);
      bufferMesh.geometry.dispose();
      bufferMesh.material.dispose();
    };
  }, [bufferScene, bufferMaterial, segments]);

  useEffect(() => {
    bufferMaterial.uniforms.uResolution.value.set(viewport.width, viewport.height);
  }, [bufferMaterial.uniforms.uResolution.value, viewport]);

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
    textureRef.current = buffer.current ? renderTargetB.texture : renderTargetA.texture;
  });

  // Expose Texture and bufferMaterial for editing
  return [textureRef, bufferMaterial];
};

export default usePingPong;
