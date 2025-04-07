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
  vec3 q = mod(p, 1.) - 0.5;
  // q.xz *= rot2D(uTime);
  // q.yx *= rot2D(uTime);
  q += translate;

  float box = sdBox(q, vec3(0.1));

  // float ground = sdGround(p) + 1.;

  // return min(ground, smin(sphere, box, 0.5));
  return smin(sphere, box, 0.25);
}

void main() {
  vec2 mouse = (uMouse * 2. - uResolution) / uResolution;
  vec2 uv = vUv * 2. - 1.;

  vec3 color = vec3(0.);

  // Initialize Raymarching Values
  vec3 ro = vec3(0., 0., -5.);
  vec3 rd = normalize(vec3(uv, 1.));
  float dt = 0.;

  // Orbit Controls
  // Vertical Rotation
  // ro.yz *= rot2D(mouse.y + 0.8);
  // rd.yz *= rot2D(mouse.y + 0.8);

  // Horizontal Rotation
  // ro.xz *= rot2D(-mouse.x * PI);
  // rd.xz *= rot2D(-mouse.x * PI);

  // Raymarch
  for (float i = 0.; i < 80.; i++) {
    vec3 p = ro + rd * dt; // Calculate (p)oint on (r)ay
    float d = map(p); // Run SDF on the calculated (p)oint

    dt += d; // Add returned SDF value to (d)istance(t)raveled

    // color = smoothstep(0.25, 1., vec3(i) / 80.); // Similar to Fresnel

    if (d < .001 || dt > 100.) break; // Stop if SDF returns small value or dt exceeds a far distance
  }

  // Coloring
  color = 1. - vec3(dt * .15);
  color *= vec3(vUv, 1.);

  gl_FragColor = vec4(color, 1.);
}