precision highp float;

uniform sampler2D uVelocity;
uniform sampler2D uQuantity;
uniform vec2 uCellScale;
uniform vec2 uAlpha;
uniform float uBeta;

varying vec2 vUv;

void main() {
  vec2 color = vec2(1.);

  vec2 xL = texture2D(uQuantity, vUv - vec2(uCellScale.x, 0.)).xy;
  vec2 xR = texture2D(uQuantity, vUv + vec2(uCellScale.x, 0.)).xy;
  vec2 xB = texture2D(uQuantity, vUv - vec2(0., uCellScale.y)).xy;
  vec2 xT = texture2D(uQuantity, vUv + vec2(0., uCellScale.y)).xy;
  vec2 bC = texture2D(uVelocity, vUv).xy;

  color = (xL + xR + xB + xT - 0.3 * bC) / uBeta;
  
  gl_FragColor = vec4(color, 0., 1.);
}