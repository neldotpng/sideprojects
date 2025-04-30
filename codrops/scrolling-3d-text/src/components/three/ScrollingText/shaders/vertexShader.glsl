uniform float uVelocity;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform float uTime;
uniform sampler2D uTexture;

varying vec2 vUv;

#define PI 3.1415926535897932384626433832795

// mat4 rotation3d(vec3 axis, float angle) {
//   axis = normalize(axis);
//   float s = sin(angle);
//   float c = cos(angle);
//   float oc = 1.0 - c;

//   return mat4(
//     oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
//     oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
//     oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
//     0.0,                                0.0,                                0.0,                                1.0
//   );
// }

vec3 deformPosition(vec3 position, vec2 uv, vec2 offset) {
  // position.x = position.x + (sin(uv.y * PI) * offset.x);
  position.y = position.y + (sin(uv.x * PI + PI / 2. * offset.x) * offset.y);
  return position;
}

float inverseLerp(float v, float minValue, float maxValue) {
  return (v - minValue) / (maxValue - minValue);
}

float remap(float v, float inMin, float inMax, float outMin, float outMax) {
  float t = inverseLerp(v, inMin, inMax);
  return mix(outMin, outMax, t);
}

// vec3 distort(vec3 p) {
//   p.x += 0.05 * sin(5. * p.y + uTime);
//   p.y += 0.05 * sin(5. * p.z + uTime);
//   p.z += 0.05 * sin(5. * p.x + uTime);
//   return p;
// }

void main() {
  // vec4 rawClip = projectionMatrix * modelViewMatrix * vec4(position, 1.);
  // vec2 clipUv = rawClip.xy / rawClip.w * 0.5 + 0.5;
  // vec4 texture = texture2D(uTexture, clipUv);

  vec3 newPosition = position;
  newPosition = deformPosition(newPosition, uv, vec2(0., uVelocity * 0.008));
  vec4 worldPosition = projectionMatrix * modelViewMatrix * vec4(newPosition.xyz, 1.0);

  // float x = remap(texture.r, -5., 5., -.5, .5);
  // float y = remap(texture.g, -5., 5., -.5, .5);
  // worldPosition.x += x;
  // worldPosition.y += y;

  gl_Position = worldPosition;

  vUv = uv;
}