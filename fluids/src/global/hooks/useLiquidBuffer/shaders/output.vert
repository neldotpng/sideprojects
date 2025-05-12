uniform vec2 uCellScale;

varying vec2 vUv;
varying vec2 vXL;
varying vec2 vXR;
varying vec2 vXB;
varying vec2 vXT;
// varying vec2 vHXL;
// varying vec2 vHXR;
// varying vec2 vHXB;
// varying vec2 vHXT;

void main() {
  vec3 pos = position;
  vec2 scale = 1. - uCellScale * 2.;
  pos.xy *= scale;

  gl_Position = vec4(pos, 1.);

  vUv = vec2(0.5) + pos.xy * 0.5;

  // vXL = vUv - vec2(uCellScale.x * 2., 0.);
  // vXR = vUv + vec2(uCellScale.x * 2., 0.);
  // vXB = vUv - vec2(0., uCellScale.y * 2.);
  // vXT = vUv + vec2(0., uCellScale.y * 2.);

  // vHXL = vUv - vec2(uCellScale.x * 1., 0.);
  // vHXR = vUv + vec2(uCellScale.x * 1., 0.);
  // vHXB = vUv - vec2(0., uCellScale.y * 1.);
  // vHXT = vUv + vec2(0., uCellScale.y * 1.);
}