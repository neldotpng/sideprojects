uniform float uScroll;
uniform bool uIntersecting;
uniform float uVelocity;
uniform vec2 uMouse;

varying vec2 vUv;

#define PI 3.1415926535897932384626433832795

mat4 rotation3d(vec3 axis, float angle) {
  axis = normalize(axis);
  float s = sin(angle);
  float c = cos(angle);
  float oc = 1.0 - c;

  return mat4(
    oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
    oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
    oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
    0.0,                                0.0,                                0.0,                                1.0
  );
}

vec3 deformPosition(vec3 position, vec2 uv, vec2 offset) {
  // position.x = position.x + (sin(uv.y * PI) * offset.x);
  position.y = position.y + (sin((uv.x + offset.x) * PI) * offset.y);
  return position;
}

void main() {
  // float rotationStrength = uv.x * 0.5;

  // vec4 newPosition = vec4(position, 1.);
  // newPosition *= rotation3d(vec3(0.0, 0.0, 1.0), uVelocity * 0.0025 * rotationStrength);

  vec2 mouse = clamp(uMouse, -0.5, 0.5);

  vec3 newPosition = position;
  newPosition = deformPosition(newPosition, uv, vec2(mouse.x, uVelocity * 0.005));

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition.xyz, 1.0);

  vUv = uv;
}