uniform float uTime;
uniform sampler2D uTexture;
// uniform sampler2D uFFTTexture;
uniform float uEnergy;
uniform float uBass;
uniform float uMids;
uniform float uHighs;
uniform float uAspect;
uniform float uPreset;

uniform vec3 uPCGC1;
uniform vec3 uPCGC2;
uniform vec3 uPCGC3;
uniform vec3 uPCGC4;

varying vec2 vUv;

#define PI 3.141592653589
#define PI2 6.28318530718

vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(PI2 * (c * t + d));
}

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

  if (uPreset == 0.) {
  }

  if (uPreset == 1.) {
    color *= e;
  }

  if (uPreset == 2.) {
    b *= 2.;
    m *= 2.;
    h *= 2.;
  }

  if (uPreset == 3.) {
    vec2 _uv = abs(vUv * 2. - 1.);
    _uv.y *= -1.;

    vec3 colpx = palette(
      1.-sin(_uv.y * _uv.x * (uEnergy - uBass) * 2.), // corners come in
      // sin((sin(_uv.y) + cos(_uv.x)) * uMids * 5.), // kinda looks like a mouth
      // vec3(0.5, 0.5, 0.5),
      // vec3(0.5, 0.5, 0.5),
      // vec3(1.0, 1.0, 1.0),
      // vec3(0.3, 0.2, 0.2)
      uPCGC1,
      uPCGC2,
      uPCGC3,
      uPCGC4
    );

    color *= e * (colpx * 1.5);
  }

  color += b;
  color += m;
  color += h;

  gl_FragColor = vec4(color, 1.);
  // gl_FragColor = texture;
}