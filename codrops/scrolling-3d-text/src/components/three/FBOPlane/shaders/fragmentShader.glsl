uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform sampler2D uTexture;
uniform sampler2D uPingPongTexture;

varying vec2 vUv;

void main() {
  // vec3 color = vec3(0.);
  vec4 tex = texture2D(uTexture, vUv);
  vec4 ppTex = texture2D(uPingPongTexture, vUv);

  // color = vec3(vUv, 1.);

  // gl_FragColor = vec4(color, 1.);
  gl_FragColor = tex;
  // gl_FragColor = ppTex;
}