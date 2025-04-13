uniform float uTime;
uniform vec2 uMouse;

varying vec2 vUv;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xy, 0., 1.);

  vUv = uv;
}