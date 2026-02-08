uniform sampler2D uVelocity;
uniform sampler2D uPingPongTexture;
uniform float uForce;
uniform float uSize;
uniform vec2 uResolution;
uniform vec2 uCellScale;
uniform float uAudioBin0;
uniform float uAudioBin1;
uniform float uAudioBin2;
uniform float uAudioBin3;
uniform float uAudioBin4;
uniform float uAudioBin5;
uniform float uAudioBin6;
uniform float uAudioBin7;
uniform float uAudioBin8;
uniform float uTime;

varying vec2 vUv;

vec2 getImpulse(in vec2 _uv, in vec2 _position, in float _binStrength) {
  vec2 dist = _uv - _position;
  float d = -dot(dist, dist);
  d /= 0.025;
  float falloff = exp(d);
  vec2 dir = normalize(dist);
  vec2 impulse = vec2(dir * _binStrength * falloff);

  if (_binStrength < 0.7) impulse *= sqrt(uAudioBin8) / 4.;

  return impulse;
}

void main() {
  float aspect = uResolution.x / uResolution.y;
  vec2 pixelRatio = 1. / uResolution;
  vec2 velocity = texture2D(uVelocity, vUv).xy;
  vec2 uv = vUv * 2. - 1.;
  
  vec2 cursorSize = pixelRatio * uSize;
  vec2 scale = cursorSize;

  vec2 dist;
  float d;
  float falloff;
  vec2 impulse;

  float time = uTime * 0.1;

  // impulse = getImpulse(uv, vec2(0.0, -0.33), uAudioBin0); // DIAMOND BOTTOM
  // impulse += getImpulse(uv, vec2(0.33, 0.0), uAudioBin3); // DIAMOND RIGHT 
  // impulse += getImpulse(uv, vec2(-0.33, 0.0), uAudioBin5); // DIAMOND LEFT 
  // impulse += getImpulse(uv, vec2(0.0, 0.33), uAudioBin3); // DIAMOND TOP
  impulse += getImpulse(uv, vec2(0.0, 0.0), (uAudioBin0 + uAudioBin1 + uAudioBin2) / 3.); // DIAMOND CENTER
  impulse += getImpulse(uv, vec2(0.66, -0.33), (uAudioBin4 + uAudioBin3) / 2.); // BR CORNER
  impulse += getImpulse(uv, vec2(-0.66, 0.33), (uAudioBin6 + uAudioBin5) / 2.); // TL CORNER
  impulse += getImpulse(uv, vec2(0.66, 0.33), uAudioBin8); // TR CORNER
  impulse += getImpulse(uv, vec2(-0.66, -0.33), uAudioBin7); // BL CORNER

  gl_FragColor = vec4(velocity + impulse, 0., 1.);
  // gl_FragColor = vec4(vec3(falloff), 1.);
}