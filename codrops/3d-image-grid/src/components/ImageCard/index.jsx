import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { createThreeDataArrayTexture } from "./functions";

import CustomShaderMaterial from "../../global/materials/CustomShaderMaterial";
import vertexShader from "./shaders/vertexShader.glsl?raw";
import fragmentShader from "./shaders/fragmentShader.glsl?raw";

// Dummy Object3D to set instance positions and update matrices
const dummy = new THREE.Object3D();

/* TODO:
 * REMOVE STATE UPDATES, SWITCH TO REF UPDATES
 */
const ImageCard = ({ imageSize = 25, margins = 25, imageScale = 2, colRows, hoverRadius = 1 }) => {
  // Mouse Position state for uniform
  const [mPos] = useState(new THREE.Vector2());
  // Used for Mouse Pointer event to normalize values
  const { size } = useThree();

  // InstanceMesh Ref
  const instancedMesh = useRef();
  // ShaderMaterial Ref, required for uniform updates
  const customShaderMaterial = useRef();

  // Parse Columns and Rows from pair
  const [col, row] = colRows;
  // Calculate total space taken up by images
  const totalSize = imageSize + margins;

  const texturesArray = useMemo(() => {
    return [
      "./textures/img1.webp",
      "./textures/img2.webp",
      "./textures/img3.webp",
      "./textures/img4.webp",
      "./textures/img5.webp",
      "./textures/img6.webp",
      "./textures/img7.webp",
      "./textures/img8.webp",
      "./textures/img9.webp",
      "./textures/img10.webp",
    ];
  }, []);

  // Generate sampler2DArray
  const textures = useMemo(() => {
    return createThreeDataArrayTexture(texturesArray, 333, 333);
  }, [texturesArray]);

  // Generate textureArray index attribute
  const texIndex = useMemo(
    () =>
      new Float32Array(
        Array.from({ length: col * row }, () => {
          return Math.floor(Math.random() * texturesArray.length);
        })
      ),
    [col, row, texturesArray]
  );

  useEffect(() => {
    // Set sampler2DArray Uniform
    textures.then((data) => {
      customShaderMaterial.current.uniforms.uTexArray.value = data;
    });
  }, [textures, size, margins, imageScale, hoverRadius]);

  useLayoutEffect(() => {
    // Calculate offset for positioning in Orthographic clip space
    const xOffset = -((col - 1) * totalSize) / 2;
    const yOffset = -((row - 1) * totalSize) / 2;

    // Counter value for total images
    let i = 0;
    for (let j = 0; j < row; j++) {
      for (let k = 0; k < col; k++) {
        // Set individual positions and shared scale for each image and set updated matrices
        dummy.position.set(xOffset + totalSize * k, yOffset + totalSize * j, 0);
        dummy.scale.setScalar(imageSize);
        dummy.updateMatrix();
        instancedMesh.current.setMatrixAt(i, dummy.matrix);
        i++;
      }
    }
    instancedMesh.current.instanceMatrix.needsUpdate = true;
  }, [col, row, imageSize, totalSize]);

  // Update Aspect Ratio Uniform
  useEffect(() => {
    customShaderMaterial.current.uniforms.uAspect = size.width / size.height;

    const onPointerMove = (e) => {
      const { clientX, clientY } = e;

      // Normalized x and y values for orthographic clip space
      // Range [-1, 1] on standard x and y axes
      const x = (clientX - 0.5 * size.width) / (size.width / 2);
      const y = -(clientY - 0.5 * size.height) / (size.height / 2);

      mPos.set(x, y);
    };

    // Add window listener
    window.addEventListener("pointermove", (e) => onPointerMove(e));

    // Remove listener on unmount
    return window.removeEventListener("pointermove", (e) => onPointerMove(e));
  }, [size, mPos]);

  // Lerp mouse position vector for slight delay
  const lerpMousePosition = (delta) => {
    customShaderMaterial.current.uniforms.uMouse.value.lerp(mPos, 1 - Math.pow(0.0125, delta));
  };

  // Update mouse position via delta time
  useFrame((state, delta) => {
    lerpMousePosition(delta);
  });

  return (
    <group>
      <instancedMesh
        ref={instancedMesh}
        // using count prop caused bugs, switched to default args
        args={[null, null, col * row]}>
        <planeGeometry args={[1, 1]}>
          <instancedBufferAttribute
            attach="attributes-index"
            args={[texIndex, 1]}
          />
        </planeGeometry>
        <CustomShaderMaterial
          ref={customShaderMaterial}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          side={THREE.DoubleSide}
          uniforms={{
            uAspect: size.width / size.height,
            uTexArray: null,
            uScale: imageScale,
            uRadius: hoverRadius,
          }}
        />
      </instancedMesh>
    </group>
  );
};

export default ImageCard;
