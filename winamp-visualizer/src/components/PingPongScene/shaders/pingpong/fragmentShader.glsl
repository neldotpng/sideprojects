uniform float uTime;
uniform sampler2D uTexture;
uniform sampler2D uFFTTexture;
uniform float uBass;
uniform float uMids;
uniform float uHighs;
uniform float uEnergy;
uniform float uAspect;

varying vec2 vUv;

#define PI 3.141592653589
#define PI2 6.28318530718

vec2 random2(vec2 st){
    st = vec2( dot(st,vec2(127.1,311.7)),
              dot(st,vec2(269.5,183.3)) );
    return -1.0 + 2.0*fract(sin(st)*43758.5453123);
}

// Gradient Noise by Inigo Quilez - iq/2013
// https://www.shadertoy.com/view/XdXGW8
float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    vec2 u = f*f*(3.0-2.0*f);

    return mix( mix( dot( random2(i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ),
                     dot( random2(i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
                mix( dot( random2(i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ),
                     dot( random2(i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
}

float random (vec2 st) {
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

void main() {
  vec2 uv = vUv / vec2(1., uAspect);
  uv = uv * 2. - 1.;
  float pn = sign(uv.y);
  pn *= sign(uv.x);
  uv = fract(uv * 4.);

  float time = uTime * 0.5;
  vec3 color = vec3(0.);

  vec2 _uv = uv * 1.25 - .6125;
  // _uv *= rot2D(uTime * 0.1 * PI2);
  vec2 rotSign = step(0., _uv);
  rotSign = rotSign * 2. - 1.;

  float pnx = sign(rotSign.x);
  float pny = sign(rotSign.y);

  // _uv *= rot2D(uTime * 120. * PI2);

  vec4 prev = texture2D(uTexture, vec2(vUv.x + (pnx * 0.001), vUv.y + (pny * 0.001)));
  float f = texture2D(uFFTTexture, _uv).r * step(0., _uv.x);
  f += texture2D(uFFTTexture, -_uv).r * step(_uv.x, 0.);
  // n = noise(uv* 50. * f);

  float dist = length(abs(uv) - 0.5) - uTime * 0.3;
  // dist = length(abs(uv) - 0.5);
  dist += pow(uEnergy, 0.5) * f * 0.0125;
  
  // dist += pow(f, 0.25) * 0.25;
  dist = fract(dist * uBass * 3.);

  // dist += pow(f, 0.5) * 0.0125;
  dist *= pow(f, 0.8);
  // dist = smoothstep(0., 1., dist);
  // f *= dist;

  // float s = step( uv.y, f ) * step( f - 0.125, uv.y );

  // Audio-reactive color
  color = mix(
    prev.rgb, 
    vec3(dist + 0.4 * abs(sin(time * 1.13)), dist + 0.3 * abs(cos(time * 1.23)), dist + 0.5 * abs(sin(time * 1.33))), 
    // vec3(dist),
    0.2
  );
  color *= 0.99; // fade

  // color *= vec3((vUv * 2. - 1.), 1.);
  // color = vec3(uv, 1.);
  // color = vec3(test, 0.);

  gl_FragColor = vec4(color, 1.);
}