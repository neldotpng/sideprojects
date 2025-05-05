uniform float uTime;
uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform vec2 uMouseVelocity;

varying vec2 vUv;

// // p : center point
// // r : petal length
// // n : number of petals in increments of 2
// // d : central diamenter
// float flower2D(vec2 p, float r, float n, float d) {
//   float s = length(p) / (r * .5);
//   float a = atan(p.x, p.y);

//   float f = cos(a * n);
//   f = abs(f) + d;

//   return 1. - smoothstep(f, f+.02, s);
// }

// mat2 rot2D(float angle) {
//   float s = sin(angle);
//   float c = cos(angle);
//   return mat2(c, -s, s, c);
// }

float inverseLerp(float v, float minValue, float maxValue) {
  return (v - minValue) / (maxValue - minValue);
}

float remap(float v, float inMin, float inMax, float outMin, float outMax) {
  float t = inverseLerp(v, inMin, inMax);
  return mix(outMin, outMax, t);
}

void main() {
  vec3 color = vec3(0.);
  vec2 uv = vUv * 2. - 1.;
  vec2 mouse = uMouse;
  float aspect = uResolution.x / uResolution.y;

  mouse.y /= aspect;
  uv.y /= aspect;

  vec2 clampedVel = clamp(uMouseVelocity, vec2(-10.), vec2(10.));
  float ripples = remap(abs(length(uMouseVelocity)), 0., 10., 2., 1.);
  float strength = remap(abs(length(uMouseVelocity)), 0., 10., 1., 1.5);

  vec3 prev = texture2D(
    uTexture, 
    vec2(
      vUv.x + (clampedVel.x * 0.0005), 
      vUv.y + (clampedVel.y * 0.0005))
  ).rgb;
  float mixStrength = .1;

  float circ = distance(uv, mouse);
  circ = 1. - smoothstep(.0, .33, circ);
  float mask = circ;

  circ = fract(circ * ripples + fract(uTime * .5) * (2. * strength)) * mask;
  circ = smoothstep(0., 1., circ);
  // vec2 dirCirc = vec2(circ) * clampedVel;
  vec2 dirCirc = vec2(mask) * clampedVel;

  color = vec3(dirCirc, 0.);
  // color = vec3(mask);

  // Mix last render with current render colors
  color = mix(
    prev, 
    color,
    mixStrength
  );

  gl_FragColor = vec4(color, 1.);
}