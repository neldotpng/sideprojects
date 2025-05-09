uniform vec2 uScale;
uniform vec2 uPx;
uniform vec2 uCenter;
uniform vec2 uForce;

varying vec2 vUv;

void main() {
  vec2 circle = (vUv - 0.5) * 2.0;
  float d = 1.0-min(length(circle), 1.0);
  d *= d;
  gl_FragColor = vec4(uForce * d, 0., 1.);
}