precision highp float;

uniform vec2 uCellScale;

varying vec2 vUv;
varying vec2 pxL;
varying vec2 pxR;
varying vec2 pxB;
varying vec2 pxT;

void main() {
  vec3 pos = position;
  vec2 scale = 1. - uCellScale;
  pos.xy *= scale;

  gl_Position = vec4(pos.xy, 0., 1.);

  vUv = pos.xy * 0.5 + 0.5;
  pxL = vUv - vec2(uCellScale.x, 0.);
  pxR = vUv + vec2(uCellScale.x, 0.);
  pxB = vUv - vec2(0., uCellScale.y);
  pxT = vUv + vec2(0., uCellScale.y);
}