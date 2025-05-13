precision highp float;

uniform sampler2D uVelocity;
uniform vec2 uCellScale;

varying vec2 vUv;

void main() {
  vec2 velocity = texture2D(uVelocity, vUv).xy;

  bool isLeft   = vUv.x < uCellScale.x * 2.;
  bool isRight  = vUv.x > 1.0 - uCellScale.x * 2.;
  bool isBottom = vUv.y < uCellScale.y * 2.;
  bool isTop    = vUv.y > 1.0 - uCellScale.y * 2.;

  // Reflect velocity at the boundaries
  if (isLeft || isRight) {
    velocity.x *= -1.0;
  }

  if (isBottom || isTop) {
    velocity.y *= -1.0;
  }

  gl_FragColor = vec4(velocity, 0.0, 1.0);
}