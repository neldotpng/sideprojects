uniform vec2 uMouse;
uniform float uAspect;
uniform float uScale;
uniform float uRadius;

attribute float index;

varying vec2 vUv;
varying float vIndex;
varying float vDist;

void main() {
  vec4 mvPosition = instanceMatrix * vec4(position, 1.);
  vec4 worldPosition = projectionMatrix * modelViewMatrix * mvPosition;

  vec2 nMouse = uMouse / vec2(1., uAspect);
  vec2 nWorldPosition = worldPosition.xy / vec2(1., uAspect);

  float dist = distance(nMouse, nWorldPosition);
  dist *= 15. * (1. / uRadius);
  dist = max(1. - dist, 0.);

  float scale = max(uScale * dist, 1.);
  float sd = dist * 0.01;
  vec3 scaledPosition = vec3(position.xy * scale, position.z + sd);

  gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(scaledPosition, 1.);

  vUv = uv;
  vIndex = index;
  vDist = dist;
}