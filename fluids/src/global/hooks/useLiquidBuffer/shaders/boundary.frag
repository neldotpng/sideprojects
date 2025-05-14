uniform sampler2D uTexture;
uniform vec2 uCellScale;
uniform vec2 uOffset;
uniform vec2 uScale;

varying vec2 vUv;

void main() {
  vec3 color = uScale * texture2D(uTexture, vUv + (uOffset * uCellScale));

  gl_FragColor = vec4(color, 1.);
}