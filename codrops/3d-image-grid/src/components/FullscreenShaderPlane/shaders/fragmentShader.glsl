uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;

varying vec2 vUv;

void main() {
  vec2 mouse = uMouse / uResolution;

  vec3 color = vec3(mouse, 1.);
  gl_FragColor = vec4(color, 1.);
}