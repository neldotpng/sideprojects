uniform float uIntersectionStrength;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform float uTime;
uniform sampler2D uPingPongTexture;

varying vec2 vUv;

void main() {
  vec2 st = gl_FragCoord.xy / uResolution.xy;
  vec3 color = vec3(0.);
  vec3 activeColor = vec3(1., 0., 0.);
  color = mix(color, activeColor, uIntersectionStrength);

  gl_FragColor = vec4(color, 1.);
}