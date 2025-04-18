// src/components/PingPongScene/shaders/includes/functions.glsl

uniform float uTime;
uniform sampler2D uTexture;
uniform sampler2D uFFTTexture;
uniform float uBass;
uniform float uMids;
uniform float uHighs;
uniform float uEnergy;
uniform float uAspect;
uniform float uPreset;

/* LEVA UNIFORMS */
uniform vec3 uRSGC1;
uniform vec3 uRSGC2;
uniform vec3 uRSGC3;
uniform vec3 uRSGC4;
uniform vec3 uRSGC5;
uniform vec3 uRSGC6;
uniform vec3 uRSGC7;
uniform vec3 uRSGC8;
uniform vec3 uSCGC1;
uniform vec3 uSCGC2;
uniform vec3 uSCGC3;
uniform vec3 uSCGC4;
uniform vec3 uMGC1;
uniform vec3 uMGC2;
uniform vec3 uMGC3;
uniform vec3 uMGC4;
uniform float uTimeStrength;
uniform float uFadeStrength;
uniform float uTrailStrength;
/* LEVA UNIFORMS END */

varying vec2 vUv;

void main() {
  vec3 color = vec3(0.);
  vec2 uv = vUv - 0.5;
  uv.y /= uAspect;

  vec3 prev = texture2D(uTexture, vUv - uTrailStrength).rgb; // Last renders' values

  float time = uTime * uTimeStrength;
  float energy = remap(uEnergy, 0., 1., .2, 1.);
  float bass = remap(uBass, 0., 1., .5, 1.);

  vec3 mask = vec3(1.); // Multiplied by final color to apply mask if necessary
  float mixStrength = uFadeStrength - (uFadeStrength-0.1)*energy;

  // vec3 debugcol = vec3(0.);


  /* 
   * SPIRALING SDF RAYMARCH
   * **** START ****
   */ 
  if (uPreset == 0.) {
    vec2 z = uv;

    // Spiral Center Points
    vec2 d1 = (1. - cos(time * 1.5)) * vec2(sin(time * 2.5), cos(time * 2.5));
    vec2 d2 = vec2(2.*sin(time * 3.), sin(time*2.));

    z*= 10.;
    z = cinv(z) * (2. + uEnergy);
    z = clog(z+d1) - clog(z+d2);
    z *= 3.;
    z /= PI;

    z = abs(fract(z) - 0.5) * 2.;
    z = smoothstep(0., 1., z);

    // Initialize Raymarching Values
    vec3 ro = vec3(0., 0., -5.);
    vec3 rd = normalize(vec3(z, 1.));
    float dt = 0.;

    float count = 75.;
    float b2 = roundh(uBass*2., 10.);
    float e3 = roundh(uEnergy*3., 10.);
    float t = uTime*.3;

    // Raymarch
    for (float i = 0.; i < count; i++) {
      vec3 p = ro + rd * dt; // Calculate (p)oint on (r)ay
      float d = map(p, vec4(b2, e3, energy, t)); // Run SDF on the calculated (p)oint

      dt += d; // Add returned SDF value to (d)istance(t)raveled

      if (d < .001 || dt > 100.) break; // Stop if SDF returns small value or dt exceeds a far distance
    }
    
    dt *= 0.05;
    dt = min(dt, 1.);

    float w = step(0.999, dt);

    /* SET VALUES VERSION */
    // vec3 pal = palette( 
    //   sin(time*1.212730)* uv.y + cos(time*2.1980312) * uv.x, 
    //   vec3(.5,.5,.5),
    //   vec3(.5,.5,.5),
    //   vec3(.5,0.,.3),
    //   vec3(0.73,0.,0.1)
    // );

    /* DEBUG VERSION */
    vec3 pal = palette( 
      sin(time*1.212730)* uv.y + cos(time*2.1980312) * uv.x, 
      uRSGC5,
      uRSGC6,
      uRSGC7,
      uRSGC8
    );
    mask = 1. - pal / 3. * w;
    
    float b = smoothstep(0.0, 0.95, dt);
    b = remap(b, 0., 0.7, 0.0, 1.);
    b = min(b, 1.);
    dt = b;

    /* SET VALUES VERSION */
    // color = palette( dt, vec3(0.5,0.5,0.5),vec3(0.5,0.5,0.5),vec3(1.0,1.0,1.0),vec3(0.3,0.20,0.20));

    /* DEBUG VERSION */
    color = palette(
      dt, 
      uRSGC1,
      uRSGC2,
      uRSGC3,
      uRSGC4
    );
  }
  /* 
   * **** END ****
   * SPIRALING SDF RAYMARCH
   */

   



  /* 
   * SPIRALING CIRCLES VISUALIZER
   * **** START ****
   */
  if (uPreset == 1.) {
    vec2 z = uv * 3.;
    float time = uTime * 0.2 + (uEnergy * 0.2);
    vec2 rot = vec2(2., 3.);

    vec2 p = vec2(pow(uBass, 2.), pow(uBass, 2.)) * 0.5;
    vec2 q = vec2(uEnergy) * -0.5;

    // Spiral Center Points
    vec2 d1 = (1. - cos(time * 1.5)) * vec2(sin(time * 2.5), cos(time * 2.5));
    vec2 d2 = vec2(2.*sin(time * 3.), sin(time*2.));
    vec2 d3 = vec2(0., 0.);
    vec2 d4 = vec2(0.6 * cos(time), 0.75 * sin(time * 0.5));
    
    z = clog(z+d1) - clog(z+d2) + clog(z + d3) + clog(z + d4);
    z *= .5/PI;

    z = cmul(rot, z);
    // z.y += time * .2;
    // z = vec2(
    //   remap(z.x, -8., 8., 0., 1.),
    //   remap(z.y, -8., 8., 0., 1.)
    // );
    // z = abs(z);
    z -= floor(z);

    // z = abs(fract(z) - 0.5) * 2.;
    // z = smoothstep(0., 1., z);

    // vec2 rotSign = z * 2. - 1.;
    // float pnx = sign(rotSign.x);
    // float pny = sign(rotSign.y);

    // vec4 prev = texture2D(uTexture, vec2(vUv.x, vUv.y));
    // float f = texture2D(uFFTTexture, uv.yx).r * step(0., uv.y);
    // f += texture2D(uFFTTexture, -uv.yx).r * step(uv.y, 0.);

    float e = remap(uEnergy, 0., 1., .2, 1.); 
    z -= .5;
    z = vec2(pow(length(z), e * 1.5));
    // z /= (pow(uEnergy, 8.) + pow(uEnergy, .9)) * 1.25;
    // z -= uEnergy * 0.2;
    z = smoothstep(0.2, e, z);
    // z = mod(z, .3);
    // z = smoothstep(0., 1., z);

    z = cdiv( z-p, z-q );

    // float imx = z.x/PI;
    // float imy = z.y/PI;

    // z = clog(z);
    // z = mod(z, 0.5);

    // color = palette( z.x + z.y, vec3(0.50,0.52,0.53), vec3(.46,.32,.35), vec3(.82,.84,.65), vec3(0.53,0.23,0.22));
    // color -= floor(color);
    // color += palette( imx, vec3(0.59,.48,0.75), vec3(.46,.32,.35), vec3(.82,.84,.65), vec3(0.53,0.23,0.22)) * .5;
    // color -= floor(color);
    // color = vec3(floor(abs(z.x)) / 8.);
    // color = vec3(z, 0.);

    /* SET VALUES VERSION */
    // color = .9 - palette(z.x, vec3(0.5,0.5,0.5),vec3(0.5,0.5,0.5),vec3(1.0,1.0,1.0),vec3(0.3,0.20,0.20));

    /* DEBUG VERSION */
    color = .9 - palette(
      z.x, 
      uSCGC1,
      uSCGC2,
      uSCGC3,
      uSCGC4);
    mixStrength = 1. - e;
  }
  /* 
   * **** END ****
   * SPIRALING CIRCLES VISUALIZER
   */





  /* 
   * MELTY VISUALIZER
   * **** START ****
   */
  if (uPreset == 2.) {
    uv = vUv * 2. - 1.;
    uv.y *= 1. / uAspect;
    vec2 z = uv * 5.;

    float n = max(bass, energy);
    float re = remap(uEnergy, 0., 1., -1., 1.);

    prev = texture2D(uTexture, vec2(vUv.x + (cos(uTime) * uTrailStrength), vUv.y + (sin(uTime) * uTrailStrength))).rgb;


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
    zz = smoothstep(0., energy, zz);
    zz += re * uHighs;
    zz *= uEnergy;

    /* SET COLORS VERSION */
    // color = palette( 
    //     zz,
    //     // vec3(.5,.5,.5),
    //     // vec3(.5,.5,.5),
    //     // vec3(1.5,1.5,1.5),
    //     // vec3(0.825,0.937,0.995)),
    //     vec3(.8,.5,.5),
    //     vec3(.4,.3,.1),
    //     vec3(1.,1.,1.),
    //     vec3(0.335,0.180,0.084));

    /* DEBUG VERSION */
    color = palette( 
      zz,
      uMGC1,
      uMGC2,
      uMGC3,
      uMGC4
    );
    mixStrength = 0.25 - (.25*energy);
  }

  /* 
   * **** END ****
   * MELTY VISUALIZER
   */







     /* 
   * ORIGINAL VISUALIZER
   * *** START ***
   */
  if (uPreset == 3.) {
    uv = uv * 2. - 1.;

    float pn = sign(uv.y);
    pn *= sign(uv.x);
    uv = fract(uv * 3.);

    float time = uTime * 0.5;

    vec2 _uv = uv - .5;
    vec2 rotSign = step(0., _uv);
    rotSign = rotSign * 2. - 1.;

    float pnx = sign(rotSign.x);
    float pny = sign(rotSign.y);

    prev = texture2D(uTexture, vec2(vUv.x + (pnx * uTrailStrength), vUv.y + (pny * uTrailStrength))).rgb;
    float f = texture2D(uFFTTexture, _uv.yx).r * step(0., _uv.y);
    f += texture2D(uFFTTexture, -_uv.yx).r * step(_uv.y, 0.);

    float dist = length(abs(uv) - 0.5) - uTime * 0.3;
    dist += pow(energy, 0.5) * f * 0.0125;
    // dist += pow(uEnergy, 0.5) * f * 0.25;
    dist = fract(dist * bass * 3.);
    dist *= pow(energy, 0.8);

    color = vec3(
      dist + 0.4 * abs(sin(time * 4.13)), 
      dist + 0.2 * abs(cos(time * 2.43)), 
      dist + 0.6 * abs(sin(time * 6.69))
    );
    mixStrength = 0.15 * f;
  }

  /* ***END***
   * ORIGINAL VISUALIZER
   */


  // Mix last render with current render colors
  color = mix(
    prev, 
    color,
    mixStrength
  );
  color *= mask; // apply mask, defaults to 1.
  color *= 0.99; // fade

  gl_FragColor = vec4(color, 1.);
  // gl_FragColor = vec4(debugcol, 1.);



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

}