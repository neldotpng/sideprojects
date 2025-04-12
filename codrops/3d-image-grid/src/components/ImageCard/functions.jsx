import * as THREE from "three";

// Load images and draw on offscreen canvas to get raw data
const loadImage = async (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

const getImageData = async (img, width, height) => {
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.scale(1, -1);
  ctx.drawImage(img, 0, -height, width, height);
  return ctx.getImageData(0, 0, width, height).data;
};

// Convert raw image data to a THREE.DataArrayTexture
export const createThreeDataArrayTexture = async (imagePaths, width, height) => {
  const depth = imagePaths.length;
  const texData = new Uint8Array(width * height * 4 * depth);

  for (let i = 0; i < depth; i++) {
    const img = await loadImage(imagePaths[i]);
    const data = await getImageData(img, width, height);
    texData.set(data, i * width * height * 4);
  }

  const texture = new THREE.DataArrayTexture(texData, width, height, depth);
  texture.format = THREE.RGBAFormat;
  texture.type = THREE.UnsignedByteType;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;

  return texture;
};
