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
 
  float xL = texture2D(uX, pxL).r;
  float xR = texture2D(uX, pxR).r;
  float xB = texture2D(uX, pxB).r;
  float xT = texture2D(uX, pxT).r;
  float bC = texture2D(uB, vUv).r;

  float color = (xL + xR + xB + xT + (uAlpha * bC)) / uBeta;

  gl_FragColor = vec4(color, 0., 0., 1.);

}