import { useFrame, useThree } from "@react-three/fiber";
import { useFBO } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

export default function PingPongExample() {
  const { gl, size } = useThree();
  const scene = useMemo(() => new THREE.Scene(), []);
  const camera = useMemo(() => {
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    cam.position.z = 1;
    return cam;
  }, []);

  // Create two FBOs
  const fboA = useFBO({
    width: size.width,
    height: size.height,
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    depthBuffer: false,
    stencilBuffer: false,
  });

  const fboB = useFBO({
    width: size.width,
    height: size.height,
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    depthBuffer: false,
    stencilBuffer: false,
  });

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uInput: { value: null },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uInput;
        varying vec2 vUv;
        void main() {
          vec4 tex = texture2D(uInput, vUv);
          gl_FragColor = vec4(tex.rgb + vec3(0.001), 1.0); // brighten over time
        }
      `,
    });
  }, []);

  const quad = useMemo(() => new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material), [material]);

  const buffer = useRef(false);
  scene.add(quad);

  useFrame(() => {
    const input = buffer.current ? fboB.texture : fboA.texture;
    const output = buffer.current ? fboA : fboB;

    material.uniforms.uInput.value = input;

    gl.setRenderTarget(output);
    gl.render(scene, camera);
    gl.setRenderTarget(null);

    buffer.current = !buffer.current;
  });

  // Display input texture on screen for debugging
  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <meshBasicMaterial map={buffer.current ? fboA.texture : fboB.texture} />
    </mesh>
  );
}
