uniform vec2 uScale;
uniform vec2 uPx;
uniform vec2 uCenter;

varying vec2 vUv;

void main() {
  vec2 pos = position.xy * uScale + uCenter;
  gl_Position = vec4(pos.xy, 0., 1.);
  
  vUv = uv;
}