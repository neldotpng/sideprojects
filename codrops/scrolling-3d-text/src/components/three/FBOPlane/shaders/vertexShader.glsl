uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform sampler2D uPingPongTexture;

varying vec2 vUv;

float inverseLerp(float v, float minValue, float maxValue) {
  return (v - minValue) / (maxValue - minValue);
}

float remap(float v, float inMin, float inMax, float outMin, float outMax) {
  float t = inverseLerp(v, inMin, inMax);
  return mix(outMin, outMax, t);
}

void main() {

  vec3 newPosition = position;
  vec4 tex = texture2D(uPingPongTexture, uv);

  // float x = remap(tex.r, -5., 5., -0.000005, 0.000005);
  // float y = remap(tex.g, -5., 5., -0.000005, 0.000005);
  // newPosition.x += tex.r;
  // newPosition.y += tex.g;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);

  vUv = uv;
}