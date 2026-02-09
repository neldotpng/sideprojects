uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform sampler2D uTexture;
uniform sampler2D uFFTTexture;
uniform float uAspect;
uniform float uNyquist;
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

// float logSample(float lowHz, float highHz, float t) {
//   float logLow  = log(lowHz);
//   float logHigh = log(highHz);
//   float freq = exp(mix(logLow, logHigh, t));
//   return freq / uNyquist;
// }

// float getLogBandEnergy(float lowHz, float highHz) {
//   float sum = 0.0;
//   const int SAMPLES = 8;

//   for (int i = 0; i < SAMPLES; i++) {
//     float t = float(i) / float(SAMPLES - 1);
//     float fftPos = logSample(lowHz, highHz, t);
//     sum += texture(uFFTTexture, vec2(fftPos, 0.5)).r;
//   }

//   return sum / float(SAMPLES);
// }

vec3 pal(float _u) {
  return palette(
    pow(_u, 6.), 
    vec3(0.7 , 0.6 , 0.5 ),
    vec3(0.5 , 0.3 , 0.2 ),
    vec3(1.0 , 1.0 , 1.0 ),
    vec3(0.5 , 0.33 , 0.2 ) 
  );
}

void main() {
  vec3 color = vec3(0.);

  vec2 uv = abs(vUv * 2. - 1.);
  float aspect = uResolution.x / uResolution.y;
  uv.y /= aspect;

  // vec2 id = floor(uv * 27.);

  vec3 prev = texture2D(uTexture, vUv).rgb; // Last renders' values

  float alpha = 1.;


  
  // if (mod(id.x, 9.) == 0. || mod(id.y, 9.) == 0.) {
  //   color = pal((u00 + u01) / 2.);
  //   alpha = (u00 + u01) / 2.;
  // }
  // if (mod(id.x, 9.) == 1. || mod(id.y, 9.) == 1.) {
  //   color = pal(u01);
  //   alpha = u01;
  // }
  // if (mod(id.x, 9.) == 2. || mod(id.y, 9.) == 2.) {
  //   color = pal(u02);
  //   alpha = u02;
  // }
  // if (mod(id.x, 9.) == 3. || mod(id.y, 9.) == 3.) {
  //   color = pal(u03);
  //   alpha = u03;
  // }
  // if (mod(id.x, 9.) == 4. || mod(id.y, 9.) == 4.) {
  //   color = pal(u04);
  //   alpha = u04;
  // } 
  // if (mod(id.x, 9.) == 5. || mod(id.y, 9.) == 5.) {
  //   color = pal(u05);
  //   alpha = u05;
  // }
  // if (mod(id.x, 9.) == 6. || mod(id.y, 9.) == 6.) {
  //   color = pal(u06);
  //   alpha = u06;
  // }
  // if (mod(id.x, 9.) == 7. || mod(id.y, 9.) == 7.) {
  //   color = pal(u07);
  //   alpha = u07;
  // }
  // if (mod(id.x, 9.) == 8. || mod(id.y, 9.) == 8.) {
  //   color = pal(u08 * 1.5);
  //   alpha = u08 * 1.5;
  // }


  // color = abs(color.r - prev.r) > 0.25 ? color : mix(color, prev, 0.95);
  // color = abs(color.r - prev.r) > 0.25 ? mix(color, prev, 0.05) : mix(color, prev, 0.8);
  // color.r = getLogBandEnergy(20., 150.);
  // color.g = getLogBandEnergy(150., 500.);
  // color.b = getLogBandEnergy(500., 2500.);
  // color.a = getLogBandEnergy(2500., 20000.);

  gl_FragColor = vec4(color, alpha);
}