uniform float uIntersectionStrength;
uniform float uScroll;
uniform float uSpeed;

varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  vec3 color = vec3(uIntersectionStrength, 0., 0.);
  // color.r = uIntersecting ? vUv.x : 0.;
  gl_FragColor = vec4(color, 1.);
}