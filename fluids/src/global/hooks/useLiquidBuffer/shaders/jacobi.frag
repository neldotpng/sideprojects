uniform sampler2D uVelocity;
uniform sampler2D uQuantity;
uniform float uAlpha;
uniform float uBeta;
uniform sampler2D uTest;

varying vec2 vUv;
varying vec2 vXL;
varying vec2 vXR;
varying vec2 vXB;
varying vec2 vXT;

void main() {
  vec4 color = vec4(1.);

  vec4 test = texture2D(uQuantity, vUv);
  vec4 test2 = texture2D(uVelocity, vUv);
  vec4 xL = texture2D(uQuantity, vXL);
  vec4 xR = texture2D(uQuantity, vXR);
  vec4 xB = texture2D(uQuantity, vXB);
  vec4 xT = texture2D(uQuantity, vXT);
  vec4 bC = texture2D(uVelocity, vUv);

  color = (xL + xR + xB + xT + uAlpha * bC) / uBeta;

  color = test + test2;
  color *= 0.99;
  gl_FragColor = color;
}