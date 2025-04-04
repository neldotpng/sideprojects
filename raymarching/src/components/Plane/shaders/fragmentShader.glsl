uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;

varying vec2 vUv;

// exponential
float smin( float a, float b, float k ) {
    k *= 1.0;
    float r = exp2(-a/k) + exp2(-b/k);
    return -k*log2(r);
}

float sdBox( vec3 p, vec3 b ) {
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}

float sdSphere( vec3 p, float s ) {
  return length(p)-s;
}

float map(vec3 p) {
  vec3 spherePos = vec3(4. * sin(uTime), 0., 0.);
  float sphere = sdSphere(p - spherePos, 1.);

  float box = sdBox(p, vec3(0.75));

  return smin(sphere, box, 0.5);
}

void main() {
  vec2 mouse = uMouse / uResolution;
  vec2 uv = vUv * 2. - 1.;

  vec3 color = vec3(0.);

  // Initialize Raymarching Values
  vec3 ro = vec3(0., 0., -5.);
  vec3 rd = normalize(vec3(uv, 1.));
  float dt = 0.;

  // Raymarch
  for (float i = 0.; i < 80.; i++) {
    vec3 p = ro + rd * dt; // Calculate (p)oint on (r)ay
    float d = map(p); // Run SDF on the calculated (p)oint

    dt += d; // Add returned SDF value to (d)istance(t)raveled

    // color = smoothstep(0.25, 1., vec3(i) / 80.); // Similar to Fresnel

    if (d < .001 || dt > 100.) break; // Stop if SDF returns small value or dt exceeds a far distance
  }

  // Coloring
  color = vec3(dt * .15);

  gl_FragColor = vec4(color, 1.);
}