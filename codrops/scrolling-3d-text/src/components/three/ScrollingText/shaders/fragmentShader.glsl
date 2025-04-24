uniform bool uIntersecting;
uniform float uScroll;
uniform float uSpeed;

varying vec2 vUv;

void main() {
  vec3 color = vec3(1., 1., 1.);
  // color.r = uIntersecting ? vUv.x : 0.;
  gl_FragColor = vec4(color, 1.);
}