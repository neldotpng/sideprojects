uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform sampler2D uTexture;
uniform sampler2D uPingPongTexture;

varying vec2 vUv;

void main() {
  vec4 tex = texture2D(uTexture, vUv);
  vec4 ppTex = texture2D(uPingPongTexture, vUv);

  gl_FragColor = tex;
}