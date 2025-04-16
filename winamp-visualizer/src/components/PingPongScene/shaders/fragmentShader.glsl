uniform float uTime;
uniform sampler2D uTexture;
// uniform sampler2D uFFTTexture;
uniform float uEnergy;
uniform float uBass;
uniform float uMids;
uniform float uHighs;
uniform float uAspect;

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
  vec2 uv = vUv;
  vec4 texture = texture2D(uTexture, uv);
  float time = uTime;
  vec3 color = vec3(0.);
  color = vec3(uEnergy) * 0.25;
  color = texture.rgb;

  vec2 _uv = abs(vUv * 2. - 1.);
  _uv.y *= -1.;

  vec3 colpx = palette(
    // 1. - sin(uTime),
    // _uv.x,
    1. - sin((sin(_uv.y) + cos(_uv.x) ) * uEnergy),
    // -sin(_uv.y * _uv.x * (uEnergy - uBass) * 3.),
    // pow(_uv.y * _uv.x, 2.5) * uEnergy,
    // dot(uv.xy, uv.yx),
    vec3(0.5, 0.5, 0.5),
    vec3(0.5, 0.5, 0.5),
    vec3(1.0, 1.0, 1.0),
    vec3(0.3, 0.2, 0.2)
  );
  vec3 colpy = palette(
    -sin(_uv.y * _uv.x * uEnergy),
    // sin(uTime * uv.y) / 2. + 0.5,
    vec3(0.5, 0.5, 0.5),
    vec3(0.5, 0.5, 0.5),
    vec3(1.0, 1.0, 1.0),
    vec3(0.3, 0.2, 0.2)
  );

  float e = remap(uEnergy, 0., 1., .5, 1.); 
  float b = remap(uBass, 0., 1., 0., 0.05); 
  float m = remap(uMids, 0., 1., 0., 0.05); 
  float h = remap(uHighs, 0., 1., 0., 0.05); 

  color *= e * (colpx * 1.5);
  // color += b;
  // color += m;
  // color += h;
  // color *= e;

  gl_FragColor = vec4(color, 1.);
  // gl_FragColor = texture;
}