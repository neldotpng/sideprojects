uniform float uTime;
uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform vec2 uMouseVelocity;

varying vec2 vUv;

void main() {
  vec3 color = vec3(0.);
  vec2 uv = vUv * 2. - 1.;
  vec2 mouse = uMouse;
  float aspect = uResolution.x / uResolution.y;

  mouse.y /= aspect;
  uv.y /= aspect;

  vec3 prev = texture2D(
    uTexture, 
    vUv
  ).rgb;
  float mixStrength = .25;

  // Mix last render with current render colors
  color = mix(
    prev, 
    color,
    mixStrength
  );

  gl_FragColor = vec4(color, 1.);
}