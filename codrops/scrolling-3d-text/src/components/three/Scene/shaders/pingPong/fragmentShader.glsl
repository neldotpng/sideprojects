uniform float uTime;
uniform sampler2D uTexture;
uniform vec2 uMouse;
// uniform float uAspect;

varying vec2 vUv;

void main() {
  vec3 color = vec3(0.);
  vec2 uv = vUv;
  vec2 mouse = (uMouse + 1.) / 2.;
  // uv.y /= uAspect;

  vec3 prev = texture2D(uTexture, vUv).rgb; // Last renders' values
  float mixStrength = 0.1;

  // color = vec3(uMouse, 0.);

  float d = distance(uv, mouse);
  d = smoothstep(0.5, 0.55, d);

  // Mix last render with current render colors
  // color = mix(
  //   prev, 
  //   color,
  //   mixStrength
  // );
  color *= 0.99; // fade
  color = vec3(uv, 0.);

  gl_FragColor = vec4(color, 1.);
}