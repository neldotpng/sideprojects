uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;

varying vec2 vUv;

#define PI 3.14159265358

// // exponential
// float smin( float a, float b, float k ) {
//     k *= 1.0;
//     float r = exp2(-a/k) + exp2(-b/k);
//     return -k*log2(r);
// }

// // root
// float smin( float a, float b, float k )
// {
//     k *= 2.0;
//     float x = b-a;
//     return 0.5*( a+b-sqrt(x*x+k*k) );
// }

float inverseLerp(float v, float minValue, float maxValue) {
  return (v - minValue) / (maxValue - minValue);
}

float remap(float v, float inMin, float inMax, float outMin, float outMax) {
  float t = inverseLerp(v, inMin, inMax);
  return mix(outMin, outMax, t);
}

// circular
float smin( float a, float b, float k )
{
    k *= 1.0/(1.0-sqrt(0.5));
    float h = max( k-abs(a-b), 0.0 )/k;
    return min(a,b) - k*0.5*(1.0+h-sqrt(1.0-h*(h-2.0)));
}

float sdBox( vec3 p, vec3 b ) {
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}

float sdSphere( vec3 p, float s ) {
  return length(p)-s;
}

float sdGround( vec3 p ) {
  return p.y;
}

mat2 rot2D(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c);
}

float map(vec3 p) {
  vec3 spherePos = vec3(0., 0., -3.);
  spherePos.x = sin(uTime) * 1.;
  spherePos.y = cos(uTime) * 1.;
  // vec3 spherePos = vec3(0., 0., 0.);
  float sphere = sdSphere(p - spherePos, 0.25);

  vec3 translate = vec3(sin(uTime), cos(uTime), 0.) * 0.1;
  vec3 q = mod(p, 1.) - 0.5; // Infinite Scale
  // q.xz *= rot2D(uTime);
  // q.yx *= rot2D(uTime);
  q += translate;

  float box = sdBox(q, vec3(0.1));

  // float ground = sdGround(p) + 1.;

  // return min(ground, smin(sphere, box, 0.5));
  return smin(sphere, box, 0.25);
}

float f(vec3 p) {
  return sdSphere(p, 0.5);
}

vec3 calcNormal( in vec3 p ) // for function f(p)
{
    float eps = 0.0001; // or some other value
    vec2 h = vec2(eps,0);
    return normalize( vec3(f(p+h.xyy) - f(p-h.xyy),
                           f(p+h.yxy) - f(p-h.yxy),
                           f(p+h.yyx) - f(p-h.yyx) ) );
}

vec3 distort(vec3 p) {
    p.x += 0.2 * sin(1. * p.y + uTime);
    // p.y += 0.2 * sin(1. * p.z + uTime);
    // p.z += 0.2 * sin(1. * p.x + uTime);
    return p;
}

void main() {
  vec2 mouse = (uMouse * 2. - uResolution) / uResolution;
  vec2 uv = vUv * 2. - 1.;
  uv.y /= uResolution.x/uResolution.y;
  mouse.y /= uResolution.x/uResolution.y;
  mouse *= 2.;

  vec3 color = vec3(0.);

  // Initialize Raymarching Values
  vec3 ro = vec3(0., 0., -5.);
  ro.z = -2.;
  vec3 rd = normalize(vec3(uv, 1.));
  float dt = 0.;

  // Orbit Controls
  // Vertical Rotation
  // ro.yz *= rot2D(mouse.y + 0.8); // Prevent lower bounds from going beneath the ground
  // rd.yz *= rot2D(mouse.y + 0.8);

  // Horizontal Rotation
  // ro.xz *= rot2D(-mouse.x * PI);
  // rd.xz *= rot2D(-mouse.x * PI);

  vec3 p = ro + rd * dt; // Calculate (p)oint on (r)ay

  // Raymarch
  for (float i = 0.; i < 80.; i++) {
    p = ro + rd * dt;
    float d = map(p); // Run SDF on the calculated (p)oint
    p.xy -= mouse;
    p = distort(p);
    d = sdSphere(p, 0.5);
    // vec3 normal = calcNormal(p);

    dt += d; // Add returned SDF value to (d)istance(t)raveled

    // color = smoothstep(0.25, 1., vec3(i) / 80.); // Similar to Fresnel

    if (d < .001 || dt > 100.) break; // Stop if SDF returns small value or dt exceeds a far distance
  }

  vec3 sky = vec3(1.);
  vec3 ground = vec3(0.0);

  vec3 normal = calcNormal(p);
  float hemiMix = remap(normal.y, -1., 1., 0., 1.);
  vec3 hemi = mix(ground, sky, hemiMix);


  vec3 lightDir = normalize(vec3(2.5, 2.5, -5.));
  vec3 lightColor = vec3(0.5);
  float dp = max(0., dot(lightDir, normal));

  vec3 diffuse = dp * lightColor;

  vec3 light = hemi * 0.0 + diffuse;


  // Coloring
  color = 1. - vec3(dt * .1);
  color += sin(uTime) * normal;
  // color = smoothstep(0.4, .41, color);
  color *= light;

  gl_FragColor = vec4(color, 1.);
}