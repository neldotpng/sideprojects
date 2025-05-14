precision highp float;

uniform sampler2D uVelocity;
uniform vec2 uCellScale;

varying vec2 vUv;

void main() {
  vec2 velocity = texture2D(uVelocity, vUv).xy;
  float strength = length(velocity);

  vec3 color = vec3(velocity.x, velocity.y, 1.0);
  color = mix(vec3(1.0), color, strength);
  color = vec3(velocity, 0.);
  color = color * 0.5 + 0.5;

  gl_FragColor = vec4(color, 1.0);
}