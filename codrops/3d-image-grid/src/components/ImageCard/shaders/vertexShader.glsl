uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uAspect;

varying vec2 vUv;

void main() {
  vec4 mvPosition = instanceMatrix * vec4(position, 1.);
  vec4 worldPosition = projectionMatrix * modelViewMatrix * mvPosition;

  vec2 nMouse = uMouse / vec2(1., uAspect);
  vec2 nWorldPosition = worldPosition.xy / vec2(1., uAspect);

  float dist = distance(nMouse, nWorldPosition);
  dist = 1. - (dist * 2.5);
  dist = max(dist, 0.);
  // dist += 1.;

  // float sd = min(floor(dist * 20.) / 1000., dist * 0.01);
  // sd = floor(dist * 20.) / 20. * 0.01;
  float sd = dist * 0.01;
  vec3 scaledPosition = vec3(position.xy * (dist + 1.), position.z + sd);

  gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(scaledPosition, 1.);
  // gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.);

  vUv = uv;
}