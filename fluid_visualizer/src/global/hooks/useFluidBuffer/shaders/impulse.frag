uniform sampler2D uVelocity;
uniform sampler2D uPingPongTexture;
uniform float uForce;
uniform float uSize;
uniform vec2 uResolution;
uniform vec2 uCellScale;
// uniform vec4 uImpulse00;
// uniform vec4 uImpulse01;
// uniform vec4 uImpulse02;
// uniform vec4 uImpulse03;
// uniform vec4 uImpulse04;
// uniform vec4 uImpulse10;
// uniform vec4 uImpulse11;
// uniform vec4 uImpulse12;
// uniform vec4 uImpulse13;
// uniform vec4 uImpulse14;
uniform float uAudioBin0;
uniform float uAudioBin1;
uniform float uAudioBin2;
uniform float uAudioBin3;
uniform float uAudioBin4;
uniform float uAudioBin5;
uniform float uAudioBin6;
uniform float uAudioBin7;
uniform float uAudioBin8;

varying vec2 vUv;

void main() {
  float aspect = uResolution.x / uResolution.y;
  vec2 pixelRatio = 1. / uResolution;
  vec2 velocity = texture2D(uVelocity, vUv).xy;
  vec2 _uv = vUv * 2. - 1.;
  
  vec2 cursorSize = pixelRatio * uSize;
  vec2 scale = cursorSize;


  vec2 dist;
  float d;
  float falloff;
  vec2 impulse;

  dist = _uv - vec2(0., 0.);
  d = -dot(dist, dist);
  d /= 0.05;
  falloff = exp(d);
  vec2 dir = normalize(dist);
  impulse = vec2(dir * uAudioBin0 * falloff);

  // // THUMB1
  // dist = _uv - uImpulse00.xy;
  // dist /= scale;

  // d = -dot(dist, dist);
  // falloff = exp(d);
  // impulse = vec2(uImpulse00.zw * uForce * falloff);

  // // INDEX1
  // dist = _uv - uImpulse01.xy;
  // dist /= scale;

  // d = -dot(dist, dist);
  // falloff = exp(d);
  // impulse += vec2(uImpulse01.zw * uForce * falloff);

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

  // // THUMB2
  // dist = _uv - uImpulse10.xy;
  // dist /= scale;

  // d = -dot(dist, dist);
  // falloff = exp(d);
  // impulse += vec2(uImpulse10.zw * uForce * falloff);

  // // INDEX2
  // dist = _uv - uImpulse11.xy;
  // dist /= scale;

  // d = -dot(dist, dist);
  // falloff = exp(d);
  // impulse += vec2(uImpulse11.zw * uForce * falloff);

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
  // gl_FragColor = vec4(dir, 1. ,1.);
}