uniform sampler2D uVelocity;
uniform vec2 uCellScale;

varying vec2 vUv;

void main() {
  vec2 halfCellScale = uCellScale * 1.;

  vec2 xL = texture2D(uVelocity, vUv - vec2(halfCellScale.x, 0.)).xy;
  vec2 xR = texture2D(uVelocity, vUv + vec2(halfCellScale.x, 0.)).xy;
  vec2 xB = texture2D(uVelocity, vUv - vec2(0., halfCellScale.y)).xy;
  vec2 xT = texture2D(uVelocity, vUv + vec2(0., halfCellScale.y)).xy;

  float div = ((xR.x - xL.x) + (xT.y - xB.y)) * 0.5;
  // div = texture2D(uVelocity, vUv).xy;
  // div = vec2((xR.x - xL.x) + (xT.y - xB.y));
  gl_FragColor = vec4(div, 0., 0., 1.);
}