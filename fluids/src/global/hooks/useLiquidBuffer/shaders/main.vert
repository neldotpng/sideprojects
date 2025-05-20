precision highp float;

uniform vec2 uCellScale;
uniform float uDeltaTime;

varying vec2 vUv;
varying vec2 pxL;
varying vec2 pxR;
varying vec2 pxB;
varying vec2 pxT;

void main() {
  vec3 pos = position;

  gl_Position = vec4(pos.xy, 0., 1.);

  vUv = pos.xy * 0.5 + 0.5;
  float frame = 1. / 60.;
  float dt = 1. / (frame / uDeltaTime);

  pxL = vUv - vec2(uCellScale.x * dt, 0.);
  pxR = vUv + vec2(uCellScale.x * dt, 0.);
  pxB = vUv - vec2(0., uCellScale.y * dt);
  pxT = vUv + vec2(0., uCellScale.y * dt);
}