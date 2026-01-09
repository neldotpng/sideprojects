uniform sampler2D uVelocity;

varying vec2 vUv;

void main() {
  vec2 vel = texture2D(uVelocity, vUv).xy;
  vel /= 2.;

  vec3 color = vec3(pow(length(vel), 1.));

  gl_FragColor = vec4(color, 1.);
}