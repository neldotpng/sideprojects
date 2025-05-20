uniform sampler2D uVorticity;
uniform sampler2D uVelocity;
uniform vec2 uCellScale;
uniform float uGridScale;
uniform float uStrength;
uniform float uDeltaTime;

varying vec2 vUv;
varying vec2 pxL;
varying vec2 pxR;
varying vec2 pxB;
varying vec2 pxT;

void main() {
  float xL = texture2D(uVorticity, pxL).x;
  float xR = texture2D(uVorticity, pxR).x;
  float xB = texture2D(uVorticity, pxB).x;
  float xT = texture2D(uVorticity, pxT).x;
  float vorticity = texture2D(uVorticity, vUv).x;

  vec2 velocity = texture2D(uVelocity, vUv).xy;
  vec2 gradient = vec2(abs(xT) - abs(xB), abs(xR) - abs(xL)) / (2. * uGridScale);

  vec2 force = uStrength * gradient * vorticity * vec2(1., -1.);
  velocity += force;

  gl_FragColor = vec4(velocity, 0., 1.);
}