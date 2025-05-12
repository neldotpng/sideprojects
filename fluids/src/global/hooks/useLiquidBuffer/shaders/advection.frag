uniform sampler2D uVelocity;
uniform float uDeltaTime;
uniform float uDissipation;
uniform vec2 uCellScale;

varying vec2 vUv;

// Input: Four pixel values (a, b, c, d) and interpolation parameters (s, t)
// Output: Interpolated value
vec4 bilerp(sampler2D tex, vec2 st) {
  // vec2 _st = floor(st - 0.5) + 0.5;
  // vec2 f = st - _st;

  // Interpolate along the x-axis
  vec4 a = texture2D(tex, st + vec2(0., 0.));
  vec4 b = texture2D(tex, st + vec2(uCellScale.x, 0.));
  vec4 c = texture2D(tex, st + vec2(0., uCellScale.y));
  vec4 d = texture2D(tex, st + vec2(uCellScale.x, uCellScale.y));

  vec4 x = mix(a, b, uCellScale.x * 10.);
  vec4 y = mix(c, d, uCellScale.x * 10.);

  // Interpolate along the y-axis
  return mix(x, y, uCellScale.y * 10.);
}

void main() {
  vec4 u1 = texture2D(uVelocity, vUv);

  vec2 pos0 = vUv - uDeltaTime * uCellScale * u1.xy;
  vec4 u0 = uDissipation * texture2D(uVelocity, pos0);

  gl_FragColor = u0;

  // vec2 _uv = vUv;
  // vec2 iPos = floor(_uv - 0.5) + 0.5;
  // vec2 f = _uv - iPos;
  // gl_FragColor = vec4(f, 0., 1.);
}