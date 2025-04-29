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

void main() {
  vec3 color = vec3(0.);
  vec2 uv = vUv * 2. - 1.;
  vec2 mouse = uMouse;
  float aspect = uResolution.x / uResolution.y;

  mouse.y /= aspect;
  uv.y /= aspect;

  vec2 clampedVel = clamp(uMouseVelocity, vec2(-10.), vec2(10.));

  vec3 prev = texture2D(
    uTexture, 
    vec2(
      vUv.x + (clampedVel.x * 0.0005), 
      vUv.y + (clampedVel.y * 0.0005))
  ).rgb;
  float mixStrength = .25;

  float circ = distance(uv, mouse);
  circ = 1. - smoothstep(.0, .25, circ);
  float mask = circ;

  circ = fract(circ + uTime * 1.5) * mask;
  circ = smoothstep(0., 1., circ);
  vec2 dirCirc = vec2(circ) * uMouseVelocity;

  // vec2 fpos = (uv - mouse) * 10.;
  // fpos *= rot2D(uTime * 5.);

  // float flower = flower2D(fpos, 2., 3., 0.1);

  // dirCirc = vec2(flower) * uMouseVelocity;

  color = vec3(dirCirc, 0.);

  // Mix last render with current render colors
  color = mix(
    prev, 
    color,
    mixStrength
  );

  gl_FragColor = vec4(color, 1.);
}