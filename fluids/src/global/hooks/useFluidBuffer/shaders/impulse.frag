precision highp float;

uniform sampler2D uVelocity;
uniform float uForce;
uniform float uSize;
uniform vec2 uResolution;
uniform vec2 uCellScale;
uniform vec2 uDelta;
uniform vec2 uPosition;

varying vec2 vUv;

void main() {
  vec2 aspect = 1. / uResolution;
  vec2 velocity = texture2D(uVelocity, vUv).xy;
  vec2 _uv = vUv * 2. - 1.;
  
  vec2 cursorSize = aspect * uSize;
  vec2 scale = cursorSize;

  vec2 dist = _uv - uPosition;
  dist /= scale;

  float d = -dot(dist, dist);
  float falloff = exp(d);
  vec2 impulse = vec2(uDelta * uForce * falloff);

  gl_FragColor = vec4(velocity + impulse, 0., 1.);
}