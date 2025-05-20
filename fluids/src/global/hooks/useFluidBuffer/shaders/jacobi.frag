precision highp float;

uniform sampler2D uX;
uniform sampler2D uB;
uniform vec2 uCellScale;
uniform float uAlpha;
uniform float uBeta;

varying vec2 vUv;
varying vec2 pxL;
varying vec2 pxR;
varying vec2 pxB;
varying vec2 pxT;

void main() {
 
  vec2 xL = texture2D(uX, pxL).rg;
  vec2 xR = texture2D(uX, pxR).rg;
  vec2 xB = texture2D(uX, pxB).rg;
  vec2 xT = texture2D(uX, pxT).rg;
  vec2 bC = texture2D(uB, vUv).rg;

  vec2 color = (xL + xR + xB + xT + (uAlpha * bC)) / uBeta;

  gl_FragColor = vec4(color, 0., 1.);

}