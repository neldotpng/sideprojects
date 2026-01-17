uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform vec3 uPosition;
uniform sampler2D uRaymarchTexture;
uniform sampler2D uTexture;

varying vec2 vUv;

float remap(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

mat2 rot2D(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c);
}

// exponential
float smin( float a, float b, float k ) {
    k *= 1.0;
    float r = exp2(-a/k) + exp2(-b/k);
    return -k*log2(r);
}

// repeat space every s units
vec3 repeated( vec3 p, float s )
{
    vec3 id = round(p/s);
    vec3 r = p - s*id;
    return r;
}

float sdBox( vec3 p, vec3 b ) {
  // b = vec3(0.3,0.2, 0.1) + 0.3*sin( id.x*111.1+id.y*2.4+vec3(0., 2., 3.) ); 
  p.yz *= rot2D(uTime);
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}

float sdSphere( vec3 p, float s ) {
  return length(p)-s;
}

float map(vec3 p) {
  vec3 pos = p;
  pos.xz *= rot2D(uTime);

  float sphere = sdSphere(pos, 0.5);
  float box = sdBox(pos, vec3(0.25));
  // return sphere;
  return box;
}

vec3 calcNormal( in vec3 p ) // for function f(p)
{
    const float eps = 0.01; // or some other value
    const vec2 h = vec2(eps,0.);
    return normalize( vec3(map(p+h.xyy) - map(p-h.xyy),
                           map(p+h.yxy) - map(p-h.yxy),
                           map(p+h.yyx) - map(p-h.yyx) ) );
}

void main() {
  vec3 color = vec3(vUv, 1.);
  float aspect = uResolution.x / uResolution.y;
  vec2 _uv = vUv;
  vec2 uv = _uv * 2. - 1.;
  uv.y /= aspect;

  // Initialize Raymarching Values
  vec3 ro = vec3(0., 0., -5.);
  vec3 rd = normalize(vec3(uv, 1.));
  float dt = 0.;
  float d = 0.;
  vec3 normal = vec3(0.);

  vec3 p = ro + rd * dt; // Calculate (p)oint on (r)ay

  // Raymarch
  for (float i = 0.; i < 80.; i++) {
    p = ro + rd * dt;

    // p.z = p.z - sin(floor(uv.y) / 2) / 10.;

    d = map(p); // Run SDF on the calculated (p)oint

    normal = calcNormal(p);

    dt += d; // Add returned SDF value to (d)istance(t)raveled

    if (d < .0001 || dt > 100.) break; // Stop if SDF returns small value or dt exceeds a far distance
  }



  color = 1. - vec3(d);
  color = clamp(color, 0., 1.);
  // color = vec3(smoothstep(dt, 0., 1.));
  color *= normal;

  gl_FragColor = vec4(color, 1.);
}