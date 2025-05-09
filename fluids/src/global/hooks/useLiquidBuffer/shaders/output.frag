uniform sampler2D uTexture;
uniform float uTime;

varying vec2 vUv;

void main() {
  vec4 tex = texture2D(uTexture, vUv);
  vec3 color = vec3(vUv, 1.);
  gl_FragColor = vec4(color, 1.);
  gl_FragColor = tex;
}