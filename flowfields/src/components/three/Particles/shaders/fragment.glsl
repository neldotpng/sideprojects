uniform vec2 uResolution;
uniform vec3 uRaycastDirection;
uniform vec3 uRaycastPoint;

varying vec2 vUv;
varying vec3 vFlow;
varying vec3 vPos;

void main() {
  vec3 color = vec3(1.);
  color = vFlow;
  gl_FragColor = vec4(color, 0.5);
}