uniform float uTime;
uniform sampler2D uTexture;
uniform sampler2D uFFTTexture;
uniform float uEnergy;
uniform float uNyquist;

varying vec2 vUv;

#define PI 3.141592653589
#define PI2 6.28318530718

float inverseLerp(float v, float minValue, float maxValue) {
  return (v - minValue) / (maxValue - minValue);
}

float remap(float v, float inMin, float inMax, float outMin, float outMax) {
  float t = inverseLerp(v, inMin, inMax);
  return mix(outMin, outMax, t);
}

void main() {
  vec3 color = vec3(0.);
  float time = uTime;

  vec2 uv = vUv.xx * 9.;
  vec2 id = floor(uv);
  vec2 fr = fract(uv);

  vec3 texture = texture2D(uTexture, vUv).rgb;
  color = texture;

  // if (id.x == 8.) color = vec3(getLogBandEnergy(20., 20000.));

  // for (float i = 0.; i < 8.; i++) {
  //   if (id.x == i) {
  //     float startHz = 20. * pow(2., i);
  //     float strength = getLogBandEnergy(startHz, startHz * 2.);
  //     color = vec3(strength);
  //   }
  // }

  gl_FragColor = vec4(color, 1.);
}