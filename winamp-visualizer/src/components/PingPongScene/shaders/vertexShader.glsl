uniform float uTime;
uniform sampler2D uTexture;
uniform sampler2D uFFTTexture;
uniform float uBass;
uniform float uMids;
uniform float uHighs;

varying vec2 vUv;

void main() {
  vec3 pos = texture2D(uTexture, uv).xyz;

  // You can animate this too
  pos.y += sin(uTime + pos.x * 10.0) * 0.1;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

  vUv = uv;
}