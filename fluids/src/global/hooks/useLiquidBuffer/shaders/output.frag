precision highp float;

uniform sampler2D uTexture;
uniform float uTime;
uniform vec2 uCellScale;

varying vec2 vUv;

precision highp float;

void main() {
  vec3 tex = texture2D(uTexture, vUv).rgb;
  float strength = length(tex.xy);

  vec3 color = tex;
  // color = vec3(strength);

  gl_FragColor = vec4(color, 1.);
}