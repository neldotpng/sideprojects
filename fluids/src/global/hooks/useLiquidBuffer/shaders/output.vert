precision highp float;

uniform vec2 uCellScale;

varying vec2 vUv;

void main() {
  vec3 pos = position;
  vec2 scale = 1. - uCellScale;
  pos.xy *= scale;

  gl_Position = vec4(pos, 1.);

  vUv = vec2(0.5) + pos.xy * 0.5;
}