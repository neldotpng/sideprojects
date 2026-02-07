uniform sampler2D uVelocity;

varying vec2 vUv;

void main() {
  vec3 vel = texture2D(uVelocity, vUv).xyz;

  vec3 color = vel + 0.5;

  gl_FragColor = vec4(color, 1.);
}