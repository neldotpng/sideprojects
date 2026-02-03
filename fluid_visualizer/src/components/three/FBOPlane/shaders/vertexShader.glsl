uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform sampler2D uPingPongTexture;

varying vec2 vUv;

void main() {
  vec3 newPosition = position;
  vec4 tex = texture2D(uPingPongTexture, uv);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);

  vUv = uv;
}