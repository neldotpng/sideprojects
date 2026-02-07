#define PI 3.1415926535897932384626433832795
#define PI2 6.28318530718

// GENERALIZED FUNCTIONS
vec2 random2(vec2 st){
    st = vec2( dot(st,vec2(127.1,311.7)),
              dot(st,vec2(269.5,183.3)) );
    return -1.0 + 2.0*fract(sin(st)*43758.5453123);
}
float random2f (vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}
float random (in float x) {
  return fract(sin(x) * 43758.5453123);
}
mat2 rot2D(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c);
}
float inverseLerp(float v, float minValue, float maxValue) {
  return (v - minValue) / (maxValue - minValue);
}
float remap(float v, float inMin, float inMax, float outMin, float outMax) {
  float t = inverseLerp(v, inMin, inMax);
  return mix(outMin, outMax, t);
}
float roundh( float x, float d ) {
  return round(x*d)/d;
}

// COMPLEX FUNCTIONS
vec2 cadd( vec2 a, float s ) { 
  return vec2( a.x+s, a.y );
}
vec2 cmul( vec2 a, vec2 b ) { 
  return vec2( a.x*b.x - a.y*b.y, a.x*b.y + a.y*b.x );
}
vec2 cdiv( vec2 a, vec2 b ) { 
  float d = dot(b,b);
  return vec2( dot(a,b), a.y*b.x - a.x*b.y ) / d; 
}
vec2 csqrt( vec2 z ) { 
  float m = length(z);
  return sqrt( 0.5*vec2(m+z.x, m-z.x) ) * vec2( 1.0, sign(z.y) ); 
}
vec2 cinv( vec2 z ) {
  float t = dot(z,z);
  return vec2( z.x, -z.y ) / t;
}
vec2 conj( vec2 z ) {
  return vec2(z.x,-z.y);
}
vec2 cpow( vec2 z, float n ) {
  float r = length(z); 
  float a = atan( z.y, z.x ); 
  return pow( r, n )*vec2( cos(a*n), sin(a*n) ); 
}

// POLAR COORDINATES
vec2 polarize( vec2 z ) {
  return vec2( length( z ), atan( z.y, z.x ) );
}
vec2 clog( vec2 a ) {
  vec2 polar = polarize( a );
  float rpart = polar.x;
  float ipart = polar.y > PI ? polar.y - PI*2. : polar.y;
  return vec2( log(rpart), ipart );
}
// COLOR PALETTE 
vec3 palette( float t, vec3 a, vec3 b, vec3 c, vec3 d ) {
  return a + b*cos( PI*2. * (c*t + d) );
}

// RAYMARCHING
// circular
float smin( float a, float b, float k )
{
    k *= 1.0/(1.0-sqrt(0.5));
    float h = max( k-abs(a-b), 0.0 )/k;
    return min(a,b) - k*0.5*(1.0+h-sqrt(1.0-h*(h-2.0)));
}
float sdSphere( vec3 p, float s ) {
  return length(p)-s;
}
vec3 opLimitedRepetition( in vec3 p, in float s, in vec3 lmin, in vec3 lmax ){
  vec3 q = p - s*clamp(round(p/s),-lmin,lmax);
  return q;
}
// a.x controls repetition expansion on x-y axes
// a.y controls repetition on z-axis
// a.z controls sphere size and strength of smooth min
// a.w controls rotation speed
float map(vec3 p, vec4 a) {
  vec3 sp = vec3(0., 0., 5.);
  sp = p - sp;

  mat2 spr = rot2D(a.w);
  sp.xz *= spr;
  sp.yz *= spr;

  vec3 r = opLimitedRepetition(
    sp, 
    3., 
    vec3(a.x, a.x, a.y), 
    vec3(a.x, a.x, a.y)
  );

  float s1 = sdSphere(sp, 2. * a.z);
  float s2 = sdSphere(r, a.z);

  return smin(s1, s2, a.z);
}
