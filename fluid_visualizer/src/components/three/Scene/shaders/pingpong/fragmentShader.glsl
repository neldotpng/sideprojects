uniform float uTime;
uniform sampler2D uTexture;
uniform sampler2D uFFTTexture;
uniform float uAspect;
uniform float uNyquist;

varying vec2 vUv;

float logSample(float lowHz, float highHz, float t) {
  float logLow  = log(lowHz);
  float logHigh = log(highHz);
  float freq = exp(mix(logLow, logHigh, t));
  return freq / uNyquist;
}

float getLogBandEnergy(float lowHz, float highHz) {
  float sum = 0.0;
  const int SAMPLES = 8;

  for (int i = 0; i < SAMPLES; i++) {
    float t = float(i) / float(SAMPLES - 1);
    float fftPos = logSample(lowHz, highHz, t);
    sum += texture(uFFTTexture, vec2(fftPos, 0.5)).r;
  }

  return sum / float(SAMPLES);
}

void main() {
  vec4 color = vec4(0.);
  vec2 uv = vUv;
  vec2 id = floor(uv.xx * 8.);

  vec3 prev = texture2D(uTexture, vUv).rgb; // Last renders' values

  // for (float i = 0.; i < 8.; i++) {
  //   if (id.x == i) {
  //     float startHz = 20. * pow(2., i);
  //     float strength = getLogBandEnergy(startHz, startHz * 2.);
  //     color = vec3(strength);
  //   }
  // }

  color.r = getLogBandEnergy(20., 150.);
  color.g = getLogBandEnergy(150., 500.);
  color.b = getLogBandEnergy(500., 2500.);
  color.a = getLogBandEnergy(2500., 20000.);

  // color = color.r < 0.7 ? vec3(pow(color.r, 2.)) : mix(color, prev, 0.9);

  gl_FragColor = color;
}