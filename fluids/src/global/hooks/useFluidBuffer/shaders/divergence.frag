precision highp float;

uniform sampler2D uVelocity;
uniform vec2 uCellScale;
uniform float uGridScale;

varying vec2 vUv;
varying vec2 pxL;
varying vec2 pxR;
varying vec2 pxB;
varying vec2 pxT;

void main() {
  vec2 xL = texture2D(uVelocity, pxL).xy;
  vec2 xR = texture2D(uVelocity, pxR).xy;
  vec2 xB = texture2D(uVelocity, pxB).xy;
  vec2 xT = texture2D(uVelocity, pxT).xy;

  float div = ((xR.x - xL.x) + (xT.y - xB.y)) / (2. * uGridScale);
  gl_FragColor = vec4(div, 0., 0., 1.);
}