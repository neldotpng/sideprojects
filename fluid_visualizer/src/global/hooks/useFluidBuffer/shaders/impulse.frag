uniform sampler2D uVelocity;
uniform sampler2D uPingPongTexture;
uniform float uForce;
uniform float uSize;
uniform vec2 uResolution;
uniform vec2 uCellScale;
uniform vec4 uImpulse00;
uniform vec4 uImpulse01;
uniform vec4 uImpulse02;
uniform vec4 uImpulse03;
uniform vec4 uImpulse04;
uniform vec4 uImpulse10;
uniform vec4 uImpulse11;
uniform vec4 uImpulse12;
uniform vec4 uImpulse13;
uniform vec4 uImpulse14;

varying vec2 vUv;

void main() {
  vec2 aspect = 1. / uResolution;
  vec2 velocity = texture2D(uVelocity, vUv).xy;
  vec2 _uv = vUv * 2. - 1.;
  vec4 ppTexture = texture2D(uPingPongTexture, vUv).rgba;
  
  vec2 cursorSize = aspect * uSize;
  vec2 scale = cursorSize;

  // THUMB1
  vec2 dist = _uv - uImpulse00.xy;
  dist = _uv - vec2(0.5);
  dist /= scale;

  float d = -dot(dist, dist);
  float falloff = exp(d);
  vec2 impulse = vec2(0.);
  if (ppTexture.r > 0.5) impulse += vec2(normalize(dist) * ppTexture.r * falloff);

  // INDEX1
  dist = _uv - uImpulse01.xy;
  dist = _uv - vec2(-0.5);
  dist /= scale;

  d = -dot(dist, dist);
  falloff = exp(d);
  if (ppTexture.g > 0.5) impulse += vec2(normalize(dist) * ppTexture.g * falloff);

  // // MIDDLE1
  // dist = _uv - uImpulse02.xy;
  // dist /= scale;

  // d = -dot(dist, dist);
  // falloff = exp(d);
  // impulse += vec2(uImpulse02.zw * uForce * falloff);

  // // RING1
  // dist = _uv - uImpulse03.xy;
  // dist /= scale;

  // d = -dot(dist, dist);
  // falloff = exp(d);
  // impulse += vec2(uImpulse03.zw * uForce * falloff);

  // // PINKY1
  // dist = _uv - uImpulse04.xy;
  // dist /= scale;

  // d = -dot(dist, dist);
  // falloff = exp(d);
  // impulse += vec2(uImpulse04.zw * uForce * falloff);

  // THUMB2
  dist = _uv - uImpulse10.xy;
  dist = _uv - vec2(-0.5, 0.5);
  dist /= scale;

  d = -dot(dist, dist);
  falloff = exp(d);
  if (ppTexture.b > 0.5) impulse += vec2(normalize(dist) * ppTexture.b * falloff);

  // INDEX2
  dist = _uv - uImpulse11.xy;
  // dist = _uv - vec2(ppTexture.a, ppTexture.b);
  dist /= scale;

  d = -dot(dist, dist);
  falloff = exp(d);
  if (ppTexture.a > 0.5) impulse += vec2(normalize(dist) * ppTexture.a * falloff);

  // // MIDDLE2
  // dist = _uv - uImpulse12.xy;
  // dist /= scale;

  // d = -dot(dist, dist);
  // falloff = exp(d);
  // impulse += vec2(uImpulse12.zw * uForce * falloff);

  // // RING2
  // dist = _uv - uImpulse13.xy;
  // dist /= scale;

  // d = -dot(dist, dist);
  // falloff = exp(d);
  // impulse += vec2(uImpulse13.zw * uForce * falloff);

  // // PINKY2
  // dist = _uv - uImpulse14.xy;
  // dist /= scale;

  // d = -dot(dist, dist);
  // falloff = exp(d);
  // impulse += vec2(uImpulse14.zw * uForce * falloff);

  gl_FragColor = vec4(velocity + impulse, 0., 1.);
}