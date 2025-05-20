uniform sampler2D uVelocity;
uniform vec2 uCellScale;
uniform float uStrength;

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

  float dx = (xR.y - xL.y) * uStrength;
  float dy = (xT.x - xB.x) * uStrength;

  float vorticity = dx - dy;

  gl_FragColor = vec4(vorticity, 0., 0., 1.);
}