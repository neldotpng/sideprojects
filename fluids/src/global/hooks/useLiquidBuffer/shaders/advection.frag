uniform sampler2D uVelocity;
// uniform sampler2D uQuantity;
uniform float uDeltaTime;
uniform float uDissipation;
uniform vec2 uCellScale;

varying vec2 vUv;

// Input: Four pixel values (a, b, c, d) and interpolation parameters (s, t)
// Output: Interpolated value
vec4 bilerp(sampler2D tex, vec2 st) {
  // Interpolate along the x-axis
  vec4 a = texture2D(tex, st + vec2(0., 0.));
  vec4 b = texture2D(tex, st + vec2(1., 0.));
  vec4 c = texture2D(tex, st + vec2(0., 1.));
  vec4 d = texture2D(tex, st + vec2(1., 1.));

  vec4 x = mix(a, b, uCellScale.x);
  vec4 y = mix(c, d, uCellScale.x);

  // Interpolate along the y-axis
  return mix(x, y, uCellScale.y);
}

void main() {
  vec4 u1 = texture2D(uVelocity, vUv);

  vec2 pos0 = vUv - uDeltaTime * uCellScale * u1.xy;
  vec4 u0 = bilerp(uVelocity, pos0);

  gl_FragColor = u0;
}