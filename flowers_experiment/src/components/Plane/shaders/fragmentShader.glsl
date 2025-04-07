uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uProgress;
uniform float uTest;

varying vec2 vUv;

// p : center point
// r : petal length
// n : number of petals in increments of 2
// d : central diamenter
vec3 flower2D(vec2 p, float r, float n, float d) {
  float s = length(p) / (r * .5);
  float a = atan(p.x, p.y);

  float f = cos(a * n);
  f = abs(f) + d;

  return vec3(1. - smoothstep(f, f+.02, s));
}

void main() {
  vec2 mouse = uMouse / uResolution;
  vec3 color = vec3(0.);
  vec2 pos = vUv - mouse;
  pos = vUv - vec2(.5);
  float t = pow(abs(sin((uTime) * .5)), 3.);

  vec3 flower1 = flower2D(pos, .5, 3. + t * 3., .5);
  flower1 *= vec3(1., 1., 0.);

  // vec3 flower2 = flower2D(pos, .2, 5., 0.3);
  // vec3 flower2 = flower2D(pos, .5 * t2, 3. + t2 * 3., .5);
  // flower2 *= vec3(1., 0., 1.);

  color = flower1;

  gl_FragColor = vec4(color, 1.);
}