uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;

varying vec2 vUv;

#define PI 3.1415926535897932384626433832795

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

vec2 random2(vec2 st){
    st = vec2( dot(st,vec2(127.1,311.7)),
              dot(st,vec2(269.5,183.3)) );
    return -1.0 + 2.0*fract(sin(st)*43758.5453123);
}

float inverseLerp(float v, float minValue, float maxValue) {
  return (v - minValue) / (maxValue - minValue);
}

float remap(float v, float inMin, float inMax, float outMin, float outMax) {
  float t = inverseLerp(v, inMin, inMax);
  return mix(outMin, outMax, t);
}

// // Calculate the sum of our first polynomial
  // vec2 polyA = uv
  //     + cmul(uv, z)
  //     + cmul(uv, cpow(z, 2.0))
  //     + cmul(uv, cpow(z, 3.0))
  //     + cmul(-uv, cpow(z, 4.0));

  // // Calculate the sum of our second polynomial
  // vec2 polyB = uv
  //     + cmul(-uv, z)
  //     + cmul(uv, cpow(z, 2.))
  //     + cmul(-uv, cpow(z, 3.));

// Adapted from https://www.shadertoy.com/view/WdSSWz
void main() {
  vec2 mouse = uMouse * 2. - 0.5;
  vec3 color = vec3(0.);
  vec2 uv = vUv - 0.5;
  uv.y *= uResolution.y / uResolution.x;
  vec2 z = uv * 3.;
  float time = uTime * 0.1;
  vec2 rot = vec2(1., 2.);

  vec2 p = vec2(sin(time * PI*2.), cos(time * PI*2.)) * 0.1;
  vec2 q = vec2(sin(time * PI*2.), cos(time * PI*2.)) * -0.1;

  // Spiral Center Points
  vec2 d1 = (1. - cos(time * 1.5)) * vec2(sin(time * 2.5), cos(time * 2.5));
  vec2 d2 = vec2(2.*sin(time * 3.), sin(time*2.));
  vec2 d3 = vec2(0., 0.);
  vec2 d4 = vec2(0.6 * cos(time), 0.75 * sin(time * 0.5));
  
  z = clog(z+d1) - clog(z+d2) + clog(z + d3) + clog(z + d4);
  z *= .5/PI;

  z = cmul(rot, z);
  z.y += time * .2;
  // z = vec2(
  //   remap(z.x, -8., 8., 0., 1.),
  //   remap(z.y, -8., 8., 0., 1.)
  // );
  // z = abs(z);
  z -= floor(z);
  z -= .5;
  z = vec2(length(z));
  z = smoothstep(0., 1., z);
  // z = mod(z, 0.5);
  // z = smoothstep(0., 1., z);

  // z = cdiv( z-p, z-q );

  float imx = z.x/PI;
  float imy = z.y/PI;

  // z = clog(z);

  color = palette( z.x + z.y, vec3(0.50,0.52,0.53), vec3(.46,.32,.35), vec3(.82,.84,.65), vec3(0.53,0.23,0.22));
  // color -= floor(color);
  // color += palette( imx, vec3(0.59,.48,0.75), vec3(.46,.32,.35), vec3(.82,.84,.65), vec3(0.53,0.23,0.22)) * .5;
  // color -= floor(color);
  // color = vec3(floor(abs(z.x)) / 8.);
  // color = vec3(z, 0.);

  gl_FragColor = vec4(color, 1.);
}