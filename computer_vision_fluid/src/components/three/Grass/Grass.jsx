import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useControls, folder } from "leva";

import CustomShaderMaterial from "@/global/materials/CustomShaderMaterial";
import grassVert from "./shaders/grass.vert?raw";
import grassFrag from "./shaders/grass.frag?raw";

import { useScrollStore } from "@/global/Stores";

const Grass = ({ fluidTexture }) => {
  const meshRef = useRef();
  const { viewport } = useThree();
  const { scrollData } = useScrollStore();

  const { GRASS_SEGMENTS, GRASS_WIDTH, GRASS_HEIGHT, ROWS } = useControls({
    Grass: folder({
      GRASS_SEGMENTS: {
        value: 2,
        min: 2,
        max: 10,
        step: 1,
        label: "Segments",
      },
      GRASS_WIDTH: {
        value: 0.02,
        min: 0.01,
        max: 1,
        step: 0.01,
        label: "Width",
      },
      GRASS_HEIGHT: {
        value: 0.2,
        min: 0.01,
        max: 1,
        step: 0.01,
        label: "Height",
      },
      ROWS: {
        value: 200,
        min: 50,
        max: 300,
        step: 1,
        label: "Rows",
      },
    }),
  });
  // const NUM_GRASS = useMemo(() => ROWS * COLS, [ROWS, COLS]);

  const GRASS_PATCH_SIZE = useMemo(
    () => new THREE.Vector2(viewport.width * 1.1, viewport.height * 1.1),
    [viewport]
  );

  const geometry = useMemo(() => {
    const VERTICES = (GRASS_SEGMENTS + 1) * 2;
    const indices = [];

    for (let i = 0; i < GRASS_SEGMENTS; i++) {
      const vi = i * 2;
      const i12 = i * 12;

      indices[i12 + 0] = vi + 0;
      indices[i12 + 1] = vi + 1;
      indices[i12 + 2] = vi + 2;
      indices[i12 + 3] = vi + 2;
      indices[i12 + 4] = vi + 1;
      indices[i12 + 5] = vi + 3;

      const fi = VERTICES + vi;
      indices[i12 + 6] = fi + 2;
      indices[i12 + 7] = fi + 1;
      indices[i12 + 8] = fi + 0;
      indices[i12 + 9] = fi + 3;
      indices[i12 + 10] = fi + 1;
      indices[i12 + 11] = fi + 2;
    }
    const NUM_GRASS = ROWS * ROWS;
    const UVS = new Float32Array(NUM_GRASS * 2);
    for (let i = 0; i < NUM_GRASS; i++) {
      const i2 = i * 2;
      const iR = Math.floor(i / ROWS); // ROWS
      const iC = Math.floor(i % ROWS); // COLUMNS
      UVS[i2 + 0] = iR / (ROWS - 1); // ROWS
      UVS[i2 + 1] = iC / (ROWS - 1); // COLUMNS
    }

    const geo = new THREE.InstancedBufferGeometry();
    geo.instanceCount = NUM_GRASS;
    geo.setIndex(indices);
    geo.setAttribute("uv", new THREE.InstancedBufferAttribute(UVS, 2));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1 + 20 * 2);

    return geo;
  }, [GRASS_SEGMENTS, ROWS]);

  const uniforms = {
    grassParams: {
      value: new THREE.Vector4(GRASS_SEGMENTS, 1, GRASS_WIDTH, GRASS_HEIGHT),
    },
    fieldParams: {
      value: new THREE.Vector4(ROWS, ROWS, GRASS_PATCH_SIZE.x, GRASS_PATCH_SIZE.y),
    },
    uTexture: { value: null },
  };

  useFrame(() => {
    meshRef.current.material.uniforms.uTexture.value = fluidTexture;

    if (!scrollData.current) return;

    const { section, sectionProgress } = scrollData.current;

    const multiplier = section <= 1 ? Math.max(1 - sectionProgress[1] * 4, 0) : 0;
    uniforms.grassParams.value.y = multiplier;
    uniforms.grassParams.value.z = GRASS_WIDTH * multiplier;

    if (multiplier === 0) {
      meshRef.current.visible = false;
    } else {
      meshRef.current.visible = true;
    }
  });

  return (
    <>
      <mesh
        ref={meshRef}
        geometry={geometry}
        position={[0, 0, -0.5]}
        rotation={[Math.PI / 2, 0, 0]}>
        <CustomShaderMaterial
          vertexShader={grassVert}
          fragmentShader={grassFrag}
          uniforms={{
            ...uniforms,
          }}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          depthTest={false}
          transparent
        />
      </mesh>
    </>
  );
};

export default Grass;
