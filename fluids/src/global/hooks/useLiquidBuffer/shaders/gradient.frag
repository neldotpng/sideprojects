precision highp float;

uniform sampler2D uVelocity;
uniform sampler2D uPressure;
uniform vec2 uCellScale;
uniform float uGridScale;

varying vec2 vUv;
varying vec2 pxL;
varying vec2 pxR;
varying vec2 pxB;
varying vec2 pxT;

void main() {
  float pL = texture2D(uPressure, pxL).x;
  float pR = texture2D(uPressure, pxR).x;
  float pB = texture2D(uPressure, pxB).x;
  float pT = texture2D(uPressure, pxT).x;
  
  vec2 velocity = texture2D(uVelocity, vUv).xy;
  vec2 pressure = vec2(pR - pL, pT - pB) / (2. * uGridScale);
  velocity -= pressure;

  gl_FragColor = vec4(velocity, 0., 1.);
}