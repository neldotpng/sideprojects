uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform sampler2D uTexture;
uniform sampler2D uFFTTexture;
uniform float uAspect;
uniform float u00;
uniform float u01;
uniform float u02;
uniform float u03;
uniform float u04;
uniform float u05;
uniform float u06;
uniform float u07;
uniform float u08;

varying vec2 vUv;

#define PI acos(-1.)
#define TAU PI*2.

mat2 rot2D(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c);
}

// folding from gaz: https://www.shadertoy.com/view/4tX3DS
vec2 fold(vec2 p, float a) {
    p.x=abs(p.x);
    vec2 n = vec2(cos(a),sin(a));
    for(int i = 0; i < 2; ++i)
    {
        p -= 2.*min(0.,dot(p,n))*n;
        n = normalize(n-vec2(1.,0.));
    }
    return p;
}

vec3 palette( float t, vec3 a, vec3 b, vec3 c, vec3 d ) {
  return a + b*cos( PI*2. * (c*t + d) );
}

vec4 mod289(vec4 x)
{
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x)
{
  return mod289(((x*34.0)+10.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec2 fade(vec2 t) {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}

// Classic Perlin noise
float cnoise(vec2 P)
{
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod289(Pi); // To avoid truncation effects in permutation
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;

  vec4 i = permute(permute(ix) + iy);

  vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0 ;
  vec4 gy = abs(gx) - 0.5 ;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;

  vec2 g00 = vec2(gx.x,gy.x);
  vec2 g10 = vec2(gx.y,gy.y);
  vec2 g01 = vec2(gx.z,gy.z);
  vec2 g11 = vec2(gx.w,gy.w);

  vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));

  float n00 = norm.x * dot(g00, vec2(fx.x, fy.x));
  float n01 = norm.y * dot(g01, vec2(fx.z, fy.z));
  float n10 = norm.z * dot(g10, vec2(fx.y, fy.y));
  float n11 = norm.w * dot(g11, vec2(fx.w, fy.w));

  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
  return 2.3 * n_xy;
}

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

vec3 path(in float delta) {
  return vec3(
    cos(delta*.1) * 2.2 + sin((delta) * .3) * .5*cos(delta * .05),
    sin(delta * .04) * 5.4 + cos(delta * .04) * 5.4,
    delta
  );
}

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
  p.xy -= path(p.z).xy;
  // p.xy = rot2D(0.05 * p.z) * p.xy;
  // p.xy = fold(p.xy, PI/6.);
  // p = mod(p, 3.) - 1.5;
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
  float time = uTime * 10.;
  // RAYMARCHING
  vec3 ro = vec3( 0., 0., 25. );
  ro = path(time);
  // camPos.x += sin(uTime);
  // camPos.z += cos(uTime);
  vec3 tar = ro + vec3(0., 0., 5.);
  tar = path(time + 25.);
  // tar.xy *= 1.1;
  // ro.xy += offset;
  // tar.y += sin(uTime * 0.1) * PI/2.;
  // tar.x += cos(uTime * 0.1) * PI/2.;
  mat3 camMat = calcLookAtMatrix( ro, tar, 0. );
  vec3 rd = normalize( camMat * vec3( uv, 1. ) );

  vec3 rm = raymarch( ro, rd, 100 );
  float dt = rm.x;
  float d = rm.y;

  vec3 p = ro + rd * dt;
  // p.y += cnoise(vec2(p.z, 0.));
  vec3 n = calcNormal( p );
  float depth = remap(p.z, ro.z - 100., ro.z + 100., -1., 1.);
  // depth = smoothstep(-0.9, 0.9, depth);

  vec3 lightDir = -rd;
  vec3 lightColor = vec3(1.);
  float dp = max( 0., dot( lightDir, n ) );
  // color = dp * lightColor * 1.;
  vec3 ip = floor(p * 0.5);
  vec3 fp = fract(p * 0.5);
  // color.z = 0.;
  // color = n * 0.5 + 0.5;
  // color = dp * lightColor * 1.;
  // fp.xy = fold(fp.xy, p.z / 10.);
  color = n;

  vec4 tex = texture2D(uTexture, fract(fp.xy * 0.5));
  // vec4 fft = texture2D(uFFTTexture, vec2((p.z - time) / 100., 0.));

  // color = palette(
  //   pow(tex.r, 6.), 
  //   vec3( 0.7 + sin(time * 0.2) * 0.1 , 0.6 + cos(time * 0.5) * 0.05 , 0.5 + sin(time * 0.3) * 0.05 ),
  //   vec3( 0.5 , 0.3 , 0.2 ),
  //   vec3( 1.0 , 1.0 , 1.0 ),
  //   vec3( 0.5, 0.33, 0.2 ) 
  // );

  // if (mod(ip, 2.).x == 0.) color = 1. - color * 0.75;
  
  float alpha = tex.a;
  alpha = 1.;
  alpha *= 1. - abs(depth);
  color = (dt > 0.0) ? color : vec3(0.0);

  // color = vec3(fold(uv, uTime), 0.);

  gl_FragColor = vec4(color, 1.);
}