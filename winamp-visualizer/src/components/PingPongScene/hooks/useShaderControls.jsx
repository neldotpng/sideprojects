import { useControls, folder } from "leva";

const useShaderControls = ({ getMaterials = () => {} }) => {
  const updateBufferPresetColor = (uniform, color) => {
    const { bufferMaterial } = getMaterials();
    if (bufferMaterial) bufferMaterial.uniforms[uniform]?.value.set(color.x, color.y, color.z);
  };

  const updateShaderPresetColor = (uniform, color) => {
    const { shaderMaterial } = getMaterials();
    if (shaderMaterial) shaderMaterial.uniforms[uniform]?.value.set(color.x, color.y, color.z);
  };

  return useControls({
    Shader: folder({
      Preset: {
        options: ["Raymarching Spheres", "Spiraling Circles", "Melty", "Pulsing Circles"],
        value: "Raymarching Spheres",
        onChange: (val) => {
          const { shaderMaterial, bufferMaterial } = getMaterials();
          let i = 0;
          switch (val) {
            case "Raymarching Spheres":
              i = 0;
              break;
            case "Spiraling Circles":
              i = 1;
              break;
            case "Melty":
              i = 2;
              break;
            case "Pulsing Circles":
              i = 3;
              break;
          }
          shaderMaterial.uniforms.uPreset.value = i;
          bufferMaterial.uniforms.uPreset.value = i;
        },
      },
      "Time Strength": {
        value: 0.1,
        min: 0,
        max: 5,
        step: 0.001,
        onChange: (val) => {
          const { bufferMaterial } = getMaterials();
          bufferMaterial.uniforms.uTimeStrength.value = val;
        },
      },
      "Fade Strength": {
        value: 0.3,
        min: 0,
        max: 1,
        step: 0.01,
        format: (v) => v.toFixed(4),
        onChange: (val) => {
          const { bufferMaterial } = getMaterials();
          bufferMaterial.uniforms.uFadeStrength.value = val;
        },
      },
      "Trail Strength": {
        value: 0,
        min: -0.01,
        max: 0.01,
        step: 0.0001,
        format: (v) => v.toFixed(4),
        onChange: (val) => {
          const { bufferMaterial } = getMaterials();
          bufferMaterial.uniforms.uTrailStrength.value = val;
        },
      },
      "Preset Values": folder({
        "Raymarching Spheres": folder(
          {
            RSGradient1: folder(
              {
                RSGC1: {
                  value: { x: 0.49, y: 0.33, z: 0.63 },
                  min: 0,
                  max: 1,
                  step: 0.01,
                  onChange: (c) => updateBufferPresetColor("uRSGC1", c),
                },
                RSGC2: {
                  value: { x: 1.0, y: 0.35, z: 0.52 },
                  min: 0,
                  max: 1,
                  step: 0.01,
                  onChange: (c) => updateBufferPresetColor("uRSGC2", c),
                },
                RSGC3: {
                  value: { x: 1.0, y: 1.0, z: 1.0 },
                  min: 0,
                  max: 10,
                  step: 0.01,
                  onChange: (c) => updateBufferPresetColor("uRSGC3", c),
                },
                RSGC4: {
                  value: { x: 0.3, y: 0.2, z: 0.2 },
                  min: 0,
                  max: 1,
                  step: 0.01,
                  onChange: (c) => updateBufferPresetColor("uRSGC4", c),
                },
              },
              { collapsed: true }
            ),
            RSGradient2: folder(
              {
                RSGC5: {
                  value: { x: 0.25, y: 0.69, z: 0.5 },
                  min: 0,
                  max: 1,
                  step: 0.01,
                  onChange: (c) => updateBufferPresetColor("uRSGC5", c),
                },
                RSGC6: {
                  value: { x: 0.76, y: 0.0, z: 0.5 },
                  min: 0,
                  max: 1,
                  step: 0.01,
                  onChange: (c) => updateBufferPresetColor("uRSGC6", c),
                },
                RSGC7: {
                  value: { x: 0.5, y: 0.0, z: 0.3 },
                  min: 0,
                  max: 1,
                  step: 0.01,
                  onChange: (c) => updateBufferPresetColor("uRSGC7", c),
                },
                RSGC8: {
                  value: { x: 0.73, y: 0.0, z: 0.1 },
                  min: 0,
                  max: 1,
                  step: 0.01,
                  onChange: (c) => updateBufferPresetColor("uRSGC8", c),
                },
              },
              { collapsed: true }
            ),
          },
          { collapsed: true }
        ),
        "Spiraling Circles": folder(
          {
            SCGradient: folder(
              {
                SCGC1: {
                  value: { x: 0.37, y: 0.67, z: 0.55 },
                  min: 0,
                  max: 1,
                  step: 0.01,
                  onChange: (c) => updateBufferPresetColor("uSCGC1", c),
                },
                SCGC2: {
                  value: { x: 0.85, y: 0.75, z: 0.66 },
                  min: 0,
                  max: 1,
                  step: 0.01,
                  onChange: (c) => updateBufferPresetColor("uSCGC2", c),
                },
                SCGC3: {
                  value: { x: 1.0, y: 1.0, z: 1.0 },
                  min: 0,
                  max: 10,
                  step: 0.01,
                  onChange: (c) => updateBufferPresetColor("uSCGC3", c),
                },
                SCGC4: {
                  value: { x: 0.3, y: 0.2, z: 0.2 },
                  min: 0,
                  max: 1,
                  step: 0.01,
                  onChange: (c) => updateBufferPresetColor("uSCGC4", c),
                },
              },
              { collapsed: true }
            ),
          },
          { collapsed: true }
        ),
        Melty: folder(
          {
            MGradient: folder(
              {
                MGC1: {
                  value: { x: 0.8, y: 0.5, z: 0.5 },
                  min: 0,
                  max: 1,
                  step: 0.01,
                  onChange: (c) => updateBufferPresetColor("uMGC1", c),
                },
                MGC2: {
                  value: { x: 0.4, y: 0.3, z: 0.1 },
                  min: 0,
                  max: 1,
                  step: 0.01,
                  onChange: (c) => updateBufferPresetColor("uMGC2", c),
                },
                MGC3: {
                  value: { x: 1.0, y: 1.0, z: 1.0 },
                  min: 0,
                  max: 10,
                  step: 0.01,
                  onChange: (c) => updateBufferPresetColor("uMGC3", c),
                },
                MGC4: {
                  value: { x: 0.335, y: 0.18, z: 0.084 },
                  min: 0,
                  max: 1,
                  step: 0.01,
                  onChange: (c) => updateBufferPresetColor("uMGC4", c),
                },
              },
              { collapsed: true }
            ),
          },
          { collapsed: true }
        ),
        "Pulsing Circles": folder(
          {
            PCGradient1: folder(
              {
                PCGC1: {
                  value: { x: 0.5, y: 0.5, z: 0.5 },
                  min: 0,
                  max: 1,
                  step: 0.01,
                  onChange: (c) => updateShaderPresetColor("uPCGC1", c),
                },
                PCGC2: {
                  value: { x: 0.5, y: 0.5, z: 0.5 },
                  min: 0,
                  max: 1,
                  step: 0.01,
                  onChange: (c) => updateShaderPresetColor("uPCGC2", c),
                },
                PCGC3: {
                  value: { x: 1.0, y: 1.0, z: 1.0 },
                  min: 0,
                  max: 10,
                  step: 0.01,
                  onChange: (c) => updateShaderPresetColor("uPCGC3", c),
                },
                PCGC4: {
                  value: { x: 0.3, y: 0.2, z: 0.2 },
                  min: 0,
                  max: 1,
                  step: 0.01,
                  onChange: (c) => updateShaderPresetColor("uPCGC4", c),
                },
              },
              { collapsed: true }
            ),
          },
          { collapsed: true }
        ),
      }),
    }),
  });
};

export default useShaderControls;
