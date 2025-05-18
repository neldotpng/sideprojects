precision highp float;

uniform sampler2D uVelocity;
uniform float uDeltaTime;
uniform float uDissipation;
uniform vec2 uCellScale;
uniform float uStep;

varying vec2 vUv;

// Input: Four pixel values (a, b, c, d) and interpolation parameters (s, t)
// Output: Interpolated value
vec4 bilerp(sampler2D tex, vec2 coord) {
  vec2 texCoord = coord / uCellScale;
  vec2 base = floor(texCoord);
  vec2 f = texCoord - base;

  // Interpolate along the x-axis
  vec4 a = texture2D(tex, (base + vec2(0., 0.)) * uCellScale);
  vec4 b = texture2D(tex, (base + vec2(1., 0.)) * uCellScale);
  vec4 c = texture2D(tex, (base + vec2(0., 1.)) * uCellScale);
  vec4 d = texture2D(tex, (base + vec2(1., 1.)) * uCellScale);

  vec4 x = mix(a, b, f.x);
  vec4 y = mix(c, d, f.x);

  // Interpolate along the y-axis
  return mix(x, y, f.y);
}

void main() {
  vec4 u1 = texture2D(uVelocity, vUv);

  vec2 pos0 = vUv - uDeltaTime * uStep * u1.xy;
  vec4 u0 = uDissipation * bilerp(uVelocity, pos0);

  gl_FragColor = u0;
}