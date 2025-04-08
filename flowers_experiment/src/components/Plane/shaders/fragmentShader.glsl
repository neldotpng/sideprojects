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
float flower2D(vec2 p, float r, float n, float d) {
  float s = length(p) / (r * .5);
  float a = atan(p.x, p.y);

  float f = cos(a * n);
  f = abs(f) + d;

  return 1. - smoothstep(f, f+.02, s);
}

float drawLine(float x, float pct) {
  return smoothstep( pct-0.01, pct, x) - smoothstep( pct, pct+0.01, x-0.9);
}

float random (in vec2 _st) {
  return fract(sin(dot(_st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

mat2 rot2D(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c);
}

void main() {
  vec2 mouse = uMouse / uResolution;
  vec3 color = vec3(0.);

  vec2 uv = vUv * 20.;

  // vec2 pos = vUv - mouse;
  vec2 ipos = floor(uv);
  vec2 fpos = fract(uv);

  vec2 pos = fract(uv) - vec2(.5);
  
  float t = pow(abs(sin((uTime) * .5)), 3.);
  float dirX = step(1., mod(ipos.y, 2.));
  float dirX2 = step(1., mod(ipos.y + 1., 2.));
  // float dirY = step(1., mod(ipos.x, 2.));
  // float dirY2 = step(1., mod(ipos.x + 1., 2.));
  
  pos *= rot2D(uTime * dirX * ceil(random(ipos) * 2.));
  pos *= rot2D(-uTime * dirX2 * ceil(random(ipos) * 2.));

  float f = flower2D(pos, 0.65, (ceil(random(ipos) * 7.) * t + 2.5), .5);
  // float line = drawLine(f, 0.02);
  // float f2 = flower2D(vUv - 0.5, 0.75, 2.5, .3);

  color = vec3(f) * random(ipos * 5.) * vec3(1., .51, .79);

  gl_FragColor = vec4(color, 1.);
}