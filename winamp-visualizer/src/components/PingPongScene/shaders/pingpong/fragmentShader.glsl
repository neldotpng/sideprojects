uniform float uTime;
uniform sampler2D uTexture;
uniform sampler2D uFFTTexture;
uniform float uBass;
uniform float uMids;
uniform float uHighs;
uniform float uEnergy;
uniform float uAspect;

varying vec2 vUv;

#define PI 3.1415926535897932384626433832795
#define PI2 6.28318530718

// // Gradient Noise by Inigo Quilez - iq/2013
// // https://www.shadertoy.com/view/XdXGW8
// float noise(vec2 st) {
//     vec2 i = floor(st);
//     vec2 f = fract(st);

//     vec2 u = f*f*(3.0-2.0*f);

//     return mix( mix( dot( random2(i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ),
//                      dot( random2(i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
//                 mix( dot( random2(i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ),
//                      dot( random2(i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
// }

float randomV (vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float random (in float x) {
  return fract(sin(x) * 43758.5453123);
}

// // Value noise by Inigo Quilez - iq/2013
// // https://www.shadertoy.com/view/lsf3WH
// float noise(vec2 st) {
//     vec2 i = floor(st);
//     vec2 f = fract(st);
//     vec2 u = f*f*(3.0-2.0*f);
//     return mix( mix( random( i + vec2(0.0,0.0) ),
//                      random( i + vec2(1.0,0.0) ), u.x),
//                 mix( random( i + vec2(0.0,1.0) ),
//                      random( i + vec2(1.0,1.0) ), u.x), u.y);
// }

mat2 rot2D(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c);
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

void main() {
  /* 
   * ORIGINAL VISUALIZER
   * *** START ***
   */
  // vec2 uv = vUv / vec2(1., uAspect);
  // vec3 color = vec3(0.);
  // uv = uv * 2. - 1.;

  // float pn = sign(uv.y);
  // pn *= sign(uv.x);
  // uv = fract(uv * 3.);

  // float time = uTime * 0.5;

  // vec2 _uv = uv - .5;
  // vec2 rotSign = step(0., _uv);
  // rotSign = rotSign * 2. - 1.;

  // float pnx = sign(rotSign.x);
  // float pny = sign(rotSign.y);

  // vec4 prev = texture2D(uTexture, vec2(vUv.x + (pnx * 0.001), vUv.y + (pny * 0.001)));
  // float f = texture2D(uFFTTexture, _uv.yx).r * step(0., _uv.y);
  // f += texture2D(uFFTTexture, -_uv.yx).r * step(_uv.y, 0.);

  // // uv *= rot2D(uTime);

  // float dist = length(abs(uv) - 0.5) - uTime * 0.3;
  // dist += pow(uEnergy, 0.5) * f * 0.0125;
  // // dist += pow(uEnergy, 0.5) * f * 0.25;
  // dist = fract(dist * uBass * 3.);
  // dist *= pow(f, 0.8);

  // // Audio-reactive color
  // color = mix(
  //   prev.rgb, 
  //   vec3(
  //     dist + 0.4 * abs(sin(time * 4.13)), 
  //     dist + 0.2 * abs(cos(time * 2.43)), 
  //     dist + 0.6 * abs(sin(time * 6.69))
  //   ), 
  //   0.15 * f 
  // );
  // color *= 0.99; // fade
  /* ***END***
   * ORIGINAL VISUALIZER
   */



  // vec4 prev = texture2D(uTexture, vUv + 0.001);
  // float fft = texture2D(uFFTTexture, vec2(0.01, 0.)).r;
  // vec2 p = uv * 10.0 + sin(fft * 10.0);
  // float d = sin(p.x + p.y + uTime);
  
  // color = vec3(noise(p));

  // // Audio-reactive color
  // color = mix(
  //   prev.rgb, 
  //   vec3(noise(p)), 
  //   d * 0.05
  // );
  // color *= 0.99; // fade




  // vec2 uv = (vUv - 0.5) / vec2(1.0, uAspect);

  // float radius = length(uv);
  // float angle = atan(uv.y, uv.x);

  // // Sample from FFT texture
  // float fft = texture2D(uFFTTexture, vec2(radius, 0.0)).r;

  // // Modulate tunnel depth and twist with FFT
  // float tunnel = fract(1.0 / (radius + 0.3) + uTime * 0.25);
  // float color = sin(tunnel * 100.0 + angle * 10.0);

  // // Rotate over time
  // angle += uTime * 0.2;
  // angle += sin(uTime + fft * 5.0) * 2.0;
  
  // // Final output
  // gl_FragColor = vec4(vec3(color * fft), 1.0);




  /* 
   * SPIRALING CIRCLES VISUALIZER
   * **** START ****
   */
  // vec3 color = vec3(0.);
  // vec2 uv = vUv - 0.5;
  // uv.y *= 1. / uAspect;
  // vec2 z = uv * 3.;
  // float time = uTime * 0.2 + (uEnergy * 0.2);
  // vec2 rot = vec2(2., 3.);

  // vec2 p = vec2(pow(uBass, 2.), pow(uBass, 2.)) * 0.5;
  // vec2 q = vec2(uEnergy) * -0.5;

  // // Spiral Center Points
  // vec2 d1 = (1. - cos(time * 1.5)) * vec2(sin(time * 2.5), cos(time * 2.5));
  // vec2 d2 = vec2(2.*sin(time * 3.), sin(time*2.));
  // vec2 d3 = vec2(0., 0.);
  // vec2 d4 = vec2(0.6 * cos(time), 0.75 * sin(time * 0.5));
  
  // z = clog(z+d1) - clog(z+d2) + clog(z + d3) + clog(z + d4);
  // z *= .5/PI;

  // z = cmul(rot, z);
  // // z.y += time * .2;
  // // z = vec2(
  // //   remap(z.x, -8., 8., 0., 1.),
  // //   remap(z.y, -8., 8., 0., 1.)
  // // );
  // // z = abs(z);
  // z -= floor(z);

  // // vec2 rotSign = z * 2. - 1.;
  // // float pnx = sign(rotSign.x);
  // // float pny = sign(rotSign.y);

  // vec4 prev = texture2D(uTexture, vec2(vUv.x, vUv.y));
  // float f = texture2D(uFFTTexture, uv.yx).r * step(0., uv.y);
  // f += texture2D(uFFTTexture, -uv.yx).r * step(uv.y, 0.);

  // float e = remap(uEnergy, 0., 1., .2, 1.); 
  // z -= .5;
  // z = vec2(pow(length(z), e * 1.5));
  // // z /= (pow(uEnergy, 8.) + pow(uEnergy, .9)) * 1.25;
  // // z -= uEnergy * 0.2;
  // z = smoothstep(0.2, e, z);
  // // z = mod(z, .3);
  // // z = smoothstep(0., 1., z);

  // z = cdiv( z-p, z-q );

  // // float imx = z.x/PI;
  // // float imy = z.y/PI;

  // // z = clog(z);

  // // z = mod(z, 0.5);

  // // color = palette( z.x + z.y, vec3(0.50,0.52,0.53), vec3(.46,.32,.35), vec3(.82,.84,.65), vec3(0.53,0.23,0.22));
  // // color -= floor(color);
  // // color += palette( imx, vec3(0.59,.48,0.75), vec3(.46,.32,.35), vec3(.82,.84,.65), vec3(0.53,0.23,0.22)) * .5;
  // // color -= floor(color);
  // // color = vec3(floor(abs(z.x)) / 8.);
  // // color = vec3(z, 0.);

  // // Audio-reactive color
  // color = mix(
  //   prev.rgb, 
  //   // palette( z.x + z.y, vec3(0.20,0.22,0.53), vec3(.46,.32,.35), vec3(.82,.84,.65), vec3(0.53,0.23,0.22)),
  //   // palette( z.x + z.y, vec3(0.5,0.5,0.5),vec3(0.5,0.5,0.5),vec3(1.0,1.0,1.0),vec3(0.0,0.10,0.20)),
  //   1. - palette( z.x + z.y, vec3(0.5,0.5,0.5),vec3(0.5,0.5,0.5),vec3(1.0,1.0,1.0),vec3(0.3,0.20,0.20)),
  //   1. - e
  // );
  // color *= 0.99; // fade

  // // color = vec3(z, 0.);
  /* 
   * **** END ****
   * SPIRALING CIRCLES VISUALIZER
   */





  /* 
   * MELTY VISUALIZER
   * **** START ****
   */

  vec3 color = vec3(0.);
  vec2 uv = vUv * 2. - 1.;
  uv.y *= 1. / uAspect;
  vec2 z = uv * 5.;
  float time = uTime * .1;
  float e = remap(uEnergy, 0., 1., .5, 1.); 
  float b = remap(uBass, 0., 1., .5, 1.);
  float n = max(b, e);
  float re = remap(uEnergy, 0., 1., -1., 1.);

  vec4 prev = texture2D(uTexture, vec2(vUv.x + (cos(uTime) * 0.0025), vUv.y + (sin(uTime) * 0.0025)));


  vec2 polyA, polyB;
  vec2 x0 = vec2(0.0);
  float count = 6.;

  for (float i=1.; i<count; i++) {
      vec2 df = vec2(-1.) + i/count;
      vec2 v = vec2(
        cos(n*10.*random(i)) - sin(time*i) * PI, 
        sin(n*10.*random(i)) - cos(time*i) * PI);
      vec2 pa = (v - df)*sign(re);
      vec2 pb = (v + df)*sign(re);
    
      polyA += cmul(
        vec2(dot(pa.xy, pa.xy) * pa.y, sqrt(abs(pa.x)) * pa.y) * uEnergy, 
        cpow(z, i)
      );
      polyB += cmul(
        vec2(sqrt(abs(pb.y)) * pb.x + dot(pb.yy, pb.xx) * pb.x,
          sqrt(abs(pb.x)) * pb.y + dot(pb.xy, pb.yx) * pb.y) * uEnergy, 
        cpow(z, i)
      );
  }

  z = cdiv(polyA, polyB);
  vec2 col = clog(z);
  col = abs(col);
  z = col/(PI);

  float zz = distance(uv*0.5, z);
  zz = smoothstep(0., e, zz);
  zz += re * uHighs;
  zz *= uEnergy;

  // Audio-reactive color
  color = mix(
    prev.rgb, 
    palette( 
      zz,
      // vec3(.5,.5,.5),
      // vec3(.5,.5,.5),
      // vec3(1.5,1.5,1.5),
      // vec3(0.825,0.937,0.995)),
      vec3(.8,.5,.5),
      vec3(.4,.3,.1),
      vec3(1.,1.,1.),
      vec3(0.335,0.180,0.084)),
    0.25 - (e * 0.25)
  );
  color *= 0.99; // fade

  /* 
   * **** END ****
   * MELTY VISUALIZER
   */

  gl_FragColor = vec4(color, 1.);
}