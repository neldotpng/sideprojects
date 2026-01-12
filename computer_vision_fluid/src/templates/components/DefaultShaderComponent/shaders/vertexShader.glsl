uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uTest;

varying vec2 vUv;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);

  vUv = uv;
}