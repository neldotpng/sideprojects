uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform sampler2D uTexture;
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
  vec4 tex = texture2D(uTexture, vUv);
  vec4 ppTex = texture2D(uPingPongTexture, vUv);

  gl_FragColor = tex;
  // gl_FragColor = abs(ppTex);
}