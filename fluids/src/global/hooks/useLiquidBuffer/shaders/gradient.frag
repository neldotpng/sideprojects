uniform sampler2D uVelocity;
uniform sampler2D uPressure;
uniform vec2 uCellScale;

varying vec2 vUv;
varying vec2 vXL;
varying vec2 vXR;
varying vec2 vXB;
varying vec2 vXT;

void main() {
  vec2 halfCellScale = uCellScale * 2.;
  float pL = texture2D(uPressure, vUv - vec2(uCellScale.x, 0.)).x;
  float pR = texture2D(uPressure, vUv + vec2(uCellScale.x, 0.)).x;
  float pB = texture2D(uPressure, vUv - vec2(0., uCellScale.y)).x;
  float pT = texture2D(uPressure, vUv + vec2(0., uCellScale.y)).x;
  float test = texture2D(uPressure, vUv).x;
  
  vec4 velocity = texture2D(uVelocity, vUv);
  velocity.xy -= halfCellScale * vec2(pR - pL, pT - pB);

  gl_FragColor = vec4(velocity.xy, 0., 1.);
}