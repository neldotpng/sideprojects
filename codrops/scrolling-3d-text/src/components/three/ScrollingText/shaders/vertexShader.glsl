uniform float uVelocity;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform float uTime;

varying vec2 vUv;
varying vec3 vClip;

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

float sdSphere( vec3 p, float s ) {
  return length(p)-s;
}

float f(vec3 p) {
  return sdSphere(p, 0.5);
}

vec3 calcNormal(vec3 p) {
  float eps = 0.0001;
  vec2 h = vec2(eps,0);
  return normalize( vec3(f(p+h.xyy) - f(p-h.xyy),
                           f(p+h.yxy) - f(p-h.yxy),
                           f(p+h.yyx) - f(p-h.yyx) ) );
}

vec3 distort(vec3 p) {
    p.x += 0.05 * sin(5. * p.y + uTime);
    p.y += 0.05 * sin(5. * p.z + uTime);
    p.z += 0.05 * sin(5. * p.x + uTime);
    return p;
}

vec3 raymarch(vec2 clip, vec2 mouse) {
  // Initialize Raymarching Values
  vec3 ro = vec3(0., 0., -2.);
  vec3 rd = normalize(vec3(clip, 1.));
  float dt = 0.;
  vec3 p = vec3(0.);

  // Raymarch
  for (float i = 0.; i < 80.; i++) {
    p = ro + rd * dt; // Calculate (p)oint on (r)ay
    p.xy -= mouse;
    // p = distort(p);
    float d = sdSphere(p, 0.3);

    dt += d; // Add returned SDF value to (d)istance(t)raveled

    // color = smoothstep(0.25, 1., vec3(i) / 80.); // Similar to Fresnel

    if (d < .001 || dt > 100.) break; // Stop if SDF returns small value or dt exceeds a far distance
  }

  vec3 sky = vec3(0., 1., 1.);
  vec3 ground = vec3(0.0, 0., 1.);

  vec3 normal = calcNormal(p);

  vec3 ambient = vec3(0.1);


  float hemiMix = remap(normal.y, -1., 1., 0., 1.);
  vec3 hemi = mix(ground, sky, hemiMix);


  vec3 lightDir = normalize(vec3(0., 0., -5.));
  vec3 lightColor = vec3(1.);
  float dp = max(0., dot(lightDir, normal));

  vec3 diffuse = dp * lightColor;

  vec3 light = ambient + hemi * 0.0 + diffuse;

  vec3 color = 1. - vec3(dt * .01);
  color *= light;

  return color;
}

void main() {
  float aspect = uResolution.x / uResolution.y;
  vec2 mouse = uMouse;
  mouse.y /= aspect;

  vec3 newPosition = position;
  newPosition = deformPosition(newPosition, uv, vec2(0., uVelocity * 0.008));
  vec4 worldPosition = projectionMatrix * modelViewMatrix * vec4(newPosition.xyz, 1.0);

  vec2 clip = worldPosition.xy;

  clip.y /= aspect;
  clip /= (uResolution * vec2(1., aspect)) / 2.;

  // vec3 sphere = raymarch(clip, mouse*2.);
  // float warp = max(min(1., sphere.z), 0.);
  float warp = distance(clip, mouse);
  warp = smoothstep(0., 0.25, warp);
  newPosition.y += warp;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition.xyz, 1.0);

  vUv = uv;
  vClip = (projectionMatrix * modelViewMatrix * vec4(position.xyz, 1.0)).xyz;
  // vSphere = sphere;
}