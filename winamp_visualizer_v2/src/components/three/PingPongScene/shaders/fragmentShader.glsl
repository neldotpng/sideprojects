uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform sampler2D uTexture;
uniform sampler2D uFFTTexture;
uniform float uAspect;

varying vec2 vUv;

#define PI acos(-1.)
#define TAU PI*2.

float inverseLerp(float v, float minValue, float maxValue) {
  return (v - minValue) / (maxValue - minValue);
}
float remap(float v, float inMin, float inMax, float outMin, float outMax) {
  float t = inverseLerp(v, inMin, inMax);
  return mix(outMin, outMax, t);
}

// exponential
float smin( float a, float b, float k ) {
    k *= 1.0;
    float r = exp2(-a/k) + exp2(-b/k);
    return -k*log2(r);
}

// polar domain repetition
vec3 moda (vec2 p, float count) {
    float an = TAU/count;
    float a = atan(p.y,p.x)+an/2.;
    float c = floor(a/an);
    a = mod(a,an)-an/2.;
    return vec3(vec2(cos(a),sin(a))*length(p),c);
}

vec2 rep( in vec2 p, in vec2 c)
{
    return mod(p,c)-0.5*c;
}

/* 
  SCENE
 */
 mat3 calcLookAtMatrix( in vec3 ro, in vec3 tar, in float roll ) {
  vec3 ww = normalize( tar - ro );
  vec3 uu = normalize( cross(ww,vec3(sin(roll),cos(roll),0.0) ) );
  vec3 vv = normalize( cross(uu,ww));
  return mat3( uu, vv, ww );
}

float map( in vec3 p ) {
  float acc = 1000.;
  // float an = atan( p.y, p.x );
  // float fft = texture2D(uFFTTexture, vec2(p.z * 0.0001, 0.)).r;
  p.xy -= vec2( sin( p.z + uTime * 0.25) , cos( p.z + uTime * 0.5) );
  // p.y += sin( p.z*2. ) * 0.1;
  float tube = -(length( p.xy ) - 2.);
  acc = min( acc, tube );
  return acc;
}

float AO( float eps, vec3 p, vec3 n ) {
  return clamp( map( p + eps * n ) / eps, 0., 1.);
}

vec3 calcNormal( in vec3 p ) // for function map(p)
{
    const float eps = 0.001; // or some other value
    const vec2 k = vec2( 1., -1. );

    return normalize( k.xyy * map(p + k.xyy * eps) +
                      k.yyx * map(p + k.yyx * eps) +
                      k.yxy * map(p + k.yxy * eps) +
                      k.xxx * map(p + k.xxx * eps) );
}

vec3 normal( in vec3 p ) {
  //tetrahedron normal
  const float n_er=0.01;
  float v1=map(vec3(p.x+n_er,p.y-n_er,p.z-n_er));
  float v2=map(vec3(p.x-n_er,p.y-n_er,p.z+n_er));
  float v3=map(vec3(p.x-n_er,p.y+n_er,p.z-n_er));
  float v4=map(vec3(p.x+n_er,p.y+n_er,p.z+n_er));
  return normalize(vec3(v4+v1-v3-v2,v3+v4-v1-v2,v2+v4-v3-v1));
}

vec3 raymarch( in vec3 ro, in vec3 rd, in int maxIterations ) {
  const float minDistance = 0.;
  const float maxDistance = 100.;
  const float precis = 0.001;

  float dt = 0.;
  float d = minDistance;
  vec3 p = ro;

  for ( int i = 0; i < maxIterations; i++ ) {
    d = map( p );
    dt += d;

    if ( d < precis ) break;
    p += rd * d * 0.5;
  }

  if ( dt > maxDistance ) dt = -1.;
  return vec3(dt, d, p.z);
}

void main() {
  vec3 color = vec3(0.);

  // NDC: center (0.5,0.5) -> (0,0), full range [-1,1], with aspect correction
  vec2 uv = vUv * 2.0 - 1.0;
  uv.y /= uResolution.x / uResolution.y;

  // vec3 prev = texture2D(uTexture, vUv).rgb; // Last renders' values

  // RAYMARCHING
  vec3 ro = vec3( 0., 0., 25. );
  // camPos.x += sin(uTime);
  // camPos.z += cos(uTime);
  vec3 tar = ro + vec3(0., 0., 5.);
  ro.z += uTime;
  tar.z = ro.z - (5. * sin(uTime * 0.1));
  tar.y += sin(uTime * 0.1) * PI/2.;
  tar.x += cos(uTime * 0.1) * PI/2.;
  mat3 camMat = calcLookAtMatrix( ro, tar, 0. );
  vec3 rd = normalize( camMat * vec3( uv, 1. ) );

  vec3 rm = raymarch( ro, rd, 100 );
  float dt = rm.x;
  float d = rm.y;

  vec3 p = ro + rd * dt;
  vec3 n = calcNormal( p );
  float depth = remap(p.z, -75. + uTime, uTime + 125., -1., 1.);
  // depth = smoothstep(-0.9, 0.9, depth);

  vec3 lightDir = -rd;
  vec3 lightColor = vec3(1.);
  float dp = max( 0., dot( lightDir, n ) );
  color = dp * lightColor * 0.5;
  color = fract(p * 0.5);

  vec4 tex = texture2D(uTexture, color.xy);
  color = tex.rgb;
  
  float alpha = tex.a;
  alpha *= 1. - abs(depth);
  // color = (dt > 0.0) ? color : vec3(0.0);
  // color = vec3(p.z) / 100.;
  // float alpha = dt == -1. ? 0.0 : 1.;
  // color = vec3(depth);

  gl_FragColor = vec4(color, alpha);
}