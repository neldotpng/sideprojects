uniform float uIntersectionStrength;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform float uTime;
uniform sampler2D uPingPongTexture;

varying vec2 vUv;

// float inverseLerp(float v, float minValue, float maxValue) {
//   return (v - minValue) / (maxValue - minValue);
// }

// float remap(float v, float inMin, float inMax, float outMin, float outMax) {
//   float t = inverseLerp(v, inMin, inMax);
//   return mix(outMin, outMax, t);
// }

void main() {
  vec2 st = gl_FragCoord.xy / uResolution.xy;
  vec3 color = vec3(0.);
  color = vec3(uIntersectionStrength);

  vec4 tex = texture2D(uPingPongTexture, st);
  gl_FragColor = tex;

  // float x = remap(tex.r, -5., 5., -.5, .5);
  // float y = remap(tex.g, -5., 5., -.5, .5);
  // vec2 warpedUv = st;
  // warpedUv.x += x;
  // warpedUv.y += y;

  // vec4 la = texture2D(uPingPongTexture, warpedUv);

  // gl_FragColor = la;

  // color = vec3(warpedUv, 1.);
  gl_FragColor = vec4(color, 1.);
}