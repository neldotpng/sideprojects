uniform float uIntersectionStrength;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform float uTime;
uniform sampler2D uPingPongTexture;

varying vec2 vUv;
varying vec3 vClip;

void main() {
  vec2 clipUv = vClip.xy / uResolution;
  clipUv += .5;
  vec2 uv = vUv;
  vec4 texture = texture2D(uPingPongTexture, clipUv);

  vec3 color = vec3(0.);
  color = vec3(1., 0., uIntersectionStrength);

  // gl_FragColor = vec4(clipUv, 1., 1.);
  gl_FragColor = texture;
}