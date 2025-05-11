// uniform vec2 uScale;
// uniform vec2 uCellScale;
uniform vec2 uCenter;
uniform vec2 uForce;

varying vec2 vUv;

void main() {
  vec2 _uv = (vUv - 0.5) * 2.0;
  float d = 1.0 - min(length(_uv), 1.0);
  gl_FragColor = vec4(uForce * d, 0., 1.);
}