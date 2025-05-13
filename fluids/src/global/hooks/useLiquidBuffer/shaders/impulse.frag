precision highp float;

uniform sampler2D uVelocity;
uniform float uForce;
uniform float uSize;
uniform vec2 uCellScale;
uniform vec2 uDelta;
uniform vec2 uPosition;

varying vec2 vUv;

void main() {
  // vec2 aspect = vec2(1., uCellScale.x / uCellScale.y);

  vec2 velocity = texture2D(uVelocity, vUv).xy;
  vec2 _uv = (vUv - 0.5) * 2.0;
  // _uv *= aspect;
  
  vec2 cursorSize = uCellScale * uSize;
  // vec2 scale = cursorSize * aspect;
  vec2 scale = cursorSize;

  vec2 bounds = 1. - cursorSize - uCellScale;
  vec2 position = clamp(uPosition, -bounds, bounds);

  vec2 dist = _uv - position;
  dist /= scale;
  float d = length(dist);
  d = 1.0 - min(d, 1.0);
  vec2 impulse = vec2(uDelta * uForce * d);

  gl_FragColor = vec4(velocity + impulse, 0., 1.);
}