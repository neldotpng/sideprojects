uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform vec2 uMouseVel;

varying vec2 vUv;

#define PI acos(-1.)
#define TAU PI*2.

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

vec3 pal( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d )
{
    return a + b*cos( 6.28318*(c*t+d) );
}

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

mat2 rot2D(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c);
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

vec3 distort(vec3 p) {
    // p.x -= min(abs(uMouseVel.x) * 7.5, 1.) * sin(p.x);
    // p.x -= uMouse.x * 2.;
    // p.y -= min(abs(uMouseVel.y) * 7.5, 1.) * sin(p.y);
    // p.y -= uMouse.y * 2.;
    p.x -= 3. * sin(p.x);
    // p.z += 0.2 * sin(1.9 * p.x + uTime);
    return p;
}

// various noise functions
float Hash3d(vec3 uv)
{
    float f = uv.x + uv.y * 37.0 + uv.z * 521.0;
    return fract(cos(f*3.333)*100003.9);
}
float mixP(float f0, float f1, float a)
{
    return mix(f0, f1, a*a*(3.0-2.0*a));
}
const vec2 zeroOne = vec2(0.0, 1.0);
float noise(vec3 uv)
{
    vec3 fr = fract(uv.xyz);
    vec3 fl = floor(uv.xyz);
    float h000 = Hash3d(fl);
    float h100 = Hash3d(fl + zeroOne.yxx);
    float h010 = Hash3d(fl + zeroOne.xyx);
    float h110 = Hash3d(fl + zeroOne.yyx);
    float h001 = Hash3d(fl + zeroOne.xxy);
    float h101 = Hash3d(fl + zeroOne.yxy);
    float h011 = Hash3d(fl + zeroOne.xyy);
    float h111 = Hash3d(fl + zeroOne.yyy);
    return mixP(
        mixP(mixP(h000, h100, fr.x), mixP(h010, h110, fr.x), fr.y),
        mixP(mixP(h001, h101, fr.x), mixP(h011, h111, fr.x), fr.y)
        , fr.z);
}

float glow = 0.0;

vec2 sim2d(
  in vec2 p,
  in float s)
{
   vec2 ret=p;
   ret+=s/2.0;
   ret=fract(ret/s)*s - s/2.;
   return ret;
}

vec2 smoothmod(vec2 p, float s, float k) {
  vec2 q = mod(p + s * 0.5, s) - s * 0.5;
  vec2 d = abs(q) - s * 0.5 + k;
  return q + clamp(-d, 0.0, k);
}

vec3 stepspace(
  in vec3 p,
  in float s)
{
  return p-mod(p-s/2.0,s);
}

vec3 lattice(vec3 p, int iter, float a)
{
		for(int i = 0; i < iter; i++)
		{
		  p.xy *= rot2D(120. * a);
			p.xz *= rot2D(15. * a);
			p=abs(p)-0.2;
			
			// p.yz *= rot2D(-45. * a);
      // p.xy *= rot2D(-20. * a);
		}
		return p;
}

float shatter(vec3 p, float d, float n, float a, float s)
{
	for(float i=0.;i<n;i++)
	{
		p.xy*=rot2D(a);
    p.xz*=rot2D(a*0.5);
    p.yz*=rot2D(a+a);
		float c = mod(i,3.) == 0. ? p.x : mod(i,3.) == 1. ? p.y : p.z;
		c=abs(c)-s;d=max(d,-c);
	}
	return d; 
}

vec3 inf( in vec3 p, in float s ) {
  vec3 rp = p;
  rp+=s/2.0;
  rp=fract(rp/s)*s - s/2.;
  return rp;
}

// float sinRepeat(float x, float s) {
//   return sin(x * PI * 2.0 / s) * s / PI;
// }

// vec2 modCentered(vec2 p, float size) {
//   return mod(p + 0.5 * size, size) - 0.5 * size;
// }

// vec2 safeRepeat(vec2 p, float size, float smoothing) {
//   vec2 m = modCentered(p, size);
//   vec2 edge = abs(fract((p + 0.5 * size) / size) - 0.5) * 2.0;
//   vec2 blend = smoothstep(0.0, smoothing, edge);
//   return mix(p, m, blend);
// }






/* 
  SCENE
 */
float makeScene( in vec3 p ) {
  const vec3 bd = vec3( 0.01 );

  vec3 rp = p;
  // p = abs(p);
  rp = inf(rp, 5.);
  vec3 ss = stepspace(p, 5.);

  // rp.xy *= rot2D(sin(ss.z * 0.2 + uTime));

  // rp.y += sin(ss.z) * 2.;
  // rp.z += cos(ss.y) * 2.;
  // rp.z += cos(ss.y * 0.1 + uTime) * 0.5;


  float obj = sdBox( rp, bd );
  rp.x += sin(uTime) * 0.5;
  float obj2 = sdSphere(rp + 0.2, 0.01);
  float c = smin(obj, obj2, 0.2);
  glow += 0.001 / (0.001 +c*c);
  return c;
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

float raymarch( in vec3 ro, in vec3 rd ) {
  const float minDistance = 0.;
  const float maxDistance = 100.;
  const float precis = 0.001;
  float dt = 0.;
  float d = minDistance;

  for ( int i = 0; i < 100; i++ ) {
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
  vec2 mouse = ( uMouse );
  vec2 uv = vUv;
  // uv = fract(uv * 2.) / 2.;
  // uv *= 2.;
  uv = uv * 2. - 1.;
  uv.y /= uResolution.x / uResolution.y;

  vec3 color = vec3(uv, 1.);

  // RAYMARCHING
  vec3 camPos = vec3(1.*sin(0.3 + 3.0*mouse.x), 0.25,1.*cos(0.3 + 3.0*mouse.x));
  // camPos = vec3( sin( 0.2*uTime ), 0.25, cos( 0.2*uTime ));
  camPos = vec3( 2.5, .1, -5. );
  camPos.z += sin(uTime * 0.5) * TAU;
  camPos.x += cos(uTime * 0.4) * TAU;
  camPos.y += sin(uTime * 0.3) * TAU;
  vec3 camTar = vec3( 0., 0., 0. );
  // camTar += camPos / 2.;
  // camTar.z += uTime;
  // camTar.y += uTime * 2.5;
  // camTar.x += uTime * 1.5;
  mat3 camMat = calcLookAtMatrix( camPos, camTar, 0. );
  vec3 camDir = normalize( camMat * vec3( uv, 1.5 ) );
  // camDir = normalize( vec3( uv, 1.) );

  float dt = raymarch( camPos, camDir );

  // NORMALS
  vec3 p = camPos + camDir * dt;
  vec3 normal = calcNormal( p );

  vec3 lightDir = normalize(vec3(0., 3., -5.));
  lightDir = -camDir;
  vec3 lightColor = vec3(1.);
  float dp = max( 0., dot( lightDir, normal ) );

  vec3 palette = pal(
    p.z * 0.1,
    vec3(0.7 , 0.6 , 0.5 ),
    vec3(0.5 , 0.5 , 0.5 ),
    vec3(1.0 , 1.0 , 1.0 ),
    vec3(0.5 , 0.3 , 0.1 ) 
  );

  vec3 diffuse = dt != 0. ? mix(vec3(0.), vec3(1.), dp) : vec3(0.);
  float ao = dt != 0. ? AO( 0.1, p, normal ) + AO( 0.3, p, normal ) + AO( 0.65, p, normal ) : 0.;
  vec3 ambient = vec3(0.1);

  color = (diffuse + ambient) * vec3(1.);
  // color = vec3(dt);
  // color = normal;
  color += glow;
  // color *= ao / 3.;
  // color = camDir;

  gl_FragColor = vec4(color, 1.);

  // Orbit Controls
  // Vertical Rotation
  // ro.yz *= rot2D(mouse.y + 0.8); // Prevent lower bounds from going beneath the ground
  // rd.yz *= rot2D(mouse.y + 0.8);

  // Horizontal Rotation
  // ro.xz *= rot2D(-mouse.x * PI);
  // rd.xz *= rot2D(-mouse.x * PI);

  // vec3 sky = vec3(1.);
  // vec3 ground = vec3(0.0);

  // vec3 normal = calcNormal(p);
  // float hemiMix = remap(normal.y, -1., 1., 0., 1.);
  // vec3 hemi = mix(ground, sky, hemiMix);

  // vec3 lightDir = normalize(vec3(2.5, 2.5, -5.));
  // vec3 lightColor = vec3(0.5);
  // float dp = max(0., dot(lightDir, normal));

  // vec3 diffuse = dp * lightColor;

  // vec3 light = hemi * 0.0 + diffuse;
}