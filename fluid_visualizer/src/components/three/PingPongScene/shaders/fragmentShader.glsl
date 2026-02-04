uniform float uTime;
uniform sampler2D uTexture;
uniform float uEnergy;
uniform float uBass;
uniform float uMids;
uniform float uHighs;

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

  vec3 texture = texture2D(uTexture, vUv).rgb;
  color = texture;

  float e = remap(uEnergy, 0., 1., .9, 1.); 
  float b = remap(uBass, 0., 1., 0., 0.05); 
  float m = remap(uMids, 0., 1., 0., 0.05); 
  float h = remap(uHighs, 0., 1., 0., 0.05); 

  color += b;
  color += m;
  color += h;

  gl_FragColor = vec4(color, 1.);
}