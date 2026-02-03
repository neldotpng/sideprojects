uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;

varying vec2 vUv;

void main() {
  vec2 mouse = uMouse / uResolution;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);

  vUv = uv;
}