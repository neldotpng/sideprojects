uniform float uTime;
uniform sampler2D uTexture;
// uniform sampler2D uFFTTexture;
uniform float uBass;
uniform float uMids;
uniform float uHighs;
uniform float uEnergy;

varying vec2 vUv;

void main() {
  float f = texture2D(uTexture, uv).r;
  f = smoothstep(0., 1., f);

  // You can animate this too
  // pos.y += sin(uTime + pos.x * 10.0) * 0.1;
  vec3 pos = position;
  // pos.z += uEnergy * f;
  // pos.z += (sin((uTime * 0.2) * 2.) / 2. + 0.5) * 2.;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

  vUv = uv;
}