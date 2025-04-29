uniform float uIntersectionStrength;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform float uTime;
uniform sampler2D uPingPongTexture;

varying vec2 vUv;
varying vec2 vClip;

void main() {
  vec2 clipUv = vClip;
  vec2 uv = clipUv * 2. - 1.;
  vec3 color = vec3(0.);
  color = vec3(uIntersectionStrength);

  vec4 texture = texture2D(uPingPongTexture, clipUv);
  gl_FragColor = texture;

  gl_FragColor = vec4(color, 1.);
}