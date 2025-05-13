precision highp float;

uniform sampler2D uVelocity;
uniform vec2 uCellScale;
uniform float uGridScale;

varying vec2 vUv;

void main() {
  // vec2 halfCellScale = 0.5 / uCellScale;

  float xL = texture2D(uVelocity, vUv - vec2(uCellScale.x, 0.)).x;
  float xR = texture2D(uVelocity, vUv + vec2(uCellScale.x, 0.)).x;
  float xB = texture2D(uVelocity, vUv - vec2(0., uCellScale.y)).y;
  float xT = texture2D(uVelocity, vUv + vec2(0., uCellScale.y)).y;

  float div = ((xR - xL) / 0.5) + ((xT - xB) / 0.5);
  gl_FragColor = vec4(div, 0., 0., 1.);
}