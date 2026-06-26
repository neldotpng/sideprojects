uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;

varying vec2 vUv;

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

float sdRoundBox( vec3 p, vec3 b, float r )
{
  vec3 q = abs(p) - b + r;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0) - r;
}

float sdSphere( vec3 p, float s ) {
  return length(p)-s;
}

float sdGround( vec3 p ) {
  return p.y;
}

float sdPlane( vec3 p, vec3 n, float h ) {
  return dot( p, n ) + h;
}

float sdCapsule( vec3 p, float h, float r )
{
  p.y += h/2.;
  p.y -= clamp( p.y, 0.0, h );
  return length( p ) - r;
}

float sdHex( vec2 p ) {
  p = abs(p);
  return max(p.x, dot(p, normalize(vec2(1., sqrt(3.)))));
}

float sdCyl( vec2 p, float c ) {
  return length(p.xy) - c;
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
float makeScene( in vec3 p ) {
  float obj = sdSphere( p, 0.5 );
  return obj;
}

float AO( float eps, vec3 p, vec3 n ) {
  return clamp( makeScene( p + eps * n ) / eps, 0., 1.);
}

vec3 calcNormal( in vec3 p ) // for function makeScene(p)
{
    const float eps = 0.001; // or some other value
    const vec2 k = vec2( 1., -1. );

    return normalize( k.xyy * makeScene(p + k.xyy * eps) +
                      k.yyx * makeScene(p + k.yyx * eps) +
                      k.yxy * makeScene(p + k.yxy * eps) +
                      k.xxx * makeScene(p + k.xxx * eps) );
}

vec3 normal( in vec3 p ) {
  //tetrahedron normal
  const float n_er=0.01;
  float v1=makeScene(vec3(p.x+n_er,p.y-n_er,p.z-n_er));
  float v2=makeScene(vec3(p.x-n_er,p.y-n_er,p.z+n_er));
  float v3=makeScene(vec3(p.x-n_er,p.y+n_er,p.z-n_er));
  float v4=makeScene(vec3(p.x+n_er,p.y+n_er,p.z+n_er));
  return normalize(vec3(v4+v1-v3-v2,v3+v4-v1-v2,v2+v4-v3-v1));
}

float raymarch( in vec3 ro, in vec3 rd, in int maxIterations ) {
  const float minDistance = 0.;
  const float maxDistance = 100.;
  const float precis = 0.001;

  float dt = 0.;
  float d = minDistance;

  for ( int i = 0; i < maxIterations; i++ ) {
    dt += d;
    d = makeScene( ro + rd * dt );

    if ( d < precis ) break;
  }

  if ( dt > maxDistance ) dt = 0.;
  return dt;
}

mat3 calcLookAtMatrix( in vec3 ro, in vec3 tar, in float roll ) {
  vec3 ww = normalize( tar - ro );
  vec3 uu = normalize( cross(ww,vec3(sin(roll),cos(roll),0.0) ) );
  vec3 vv = normalize( cross(uu,ww));
  return mat3( uu, vv, ww );
}

void main() {
  vec3 color = vec3(0.);

  // NDC: center (0.5,0.5) -> (0,0), full range [-1,1], with aspect correction
  vec2 uv = vUv * 2.0 - 1.0;
  uv.y /= uAspect;

  vec3 prev = texture2D(uTexture, vUv).rgb; // Last renders' values

  // RAYMARCHING
  vec3 camPos = vec3(0., 0., 5.);
  vec3 camTar = vec3( 0., 0., 0. );
  mat3 camMat = calcLookAtMatrix( camPos, camTar, 0. );
  vec3 camDir = normalize( camMat * vec3( uv, 1. ) );

  float dt = raymarch( camPos, camDir, 100 );

  vec3 p = camPos + camDir * dt;
  vec3 n = calcNormal( p );
  // Only shade on hit; when dt==0 we're in the sky (normal at camPos is meaningless)
  color = (dt > 0.0) ? n : vec3(0.0);

  gl_FragColor = vec4(color, 1.);
}