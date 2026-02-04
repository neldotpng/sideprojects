// src/components/PingPongScene/shaders/includes/functions.glsl

uniform float uTime;
uniform sampler2D uTexture;
uniform sampler2D uFFTTexture;
uniform float uBass;
uniform float uMids;
uniform float uHighs;
uniform float uEnergy;
uniform float uAspect;

/* LEVA UNIFORMS */
// uniform float uPreset;
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

  vec3 prev = texture2D(uTexture, vUv).rgb; // Last renders' values

  float time = uTime * uTimeStrength;
  float energy = remap(uEnergy, 0., 1., .2, 1.);
  float bass = remap(uBass, 0., 1., .5, 1.);

  vec3 mask = vec3(1.); // Multiplied by final color to apply mask if necessary
  float mixStrength = uFadeStrength;

  // vec3 debugcol = vec3(0.);


  /* 
   * SPIRALING SDF RAYMARCH
   * **** START ****
   */ 
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

    float count = 200.;
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
    
    dt *= 0.075;
    dt = min(dt, 1.);

    float w = 1.2 - smoothstep(0.1, 1., dt);
    w *= step(0.25, w);

    // Mask Palette
    vec3 mPal = palette( 
      // sin(time*1.212730)* uv.y + cos(time*2.1980312) * uv.x, 
      length(uv * uBass) * sin(uEnergy) * 5.,
      vec3(.5,.5,.5),
      vec3(.5,.5,.5),
      vec3(1.,1.,1.),
      vec3(0.08,0.,0.9)

      // vec3(0.5, 0.5, 0.5),
      // vec3(0.5, 0.5, 0.5),
      // vec3(1., 1., 1.),
      // vec3(0.3, 0.2, 0.1)
    );

    vec3 nmask = vec3(step(w, 0.1));
    mask = vec3(step(1. - w, 0.5));
    mask += vec3(uBass*0.25, uHighs*0.25, uEnergy*0.25) * ( mPal);
    mask += w;
    mask = smoothstep(0., 1., min(mask, 1.));
    
    float b = smoothstep(0.0, 0.95, dt);
    b = remap(b, 0., 0.7, 0.0, 1.);
    b = min(b, 1.);
    dt = b;

    color = palette( 
      dt, 
      vec3(0.62, 0.31, .59), // ver 2 start
      vec3(1., 1., 1.),
      vec3( 1.05, 1., 1.),
      vec3(0.63, 0.5, 0.33)
    );

    color *= mask;
    color += nmask * mask;
    mask = vec3(1.);

    prev = texture2D(uTexture, vUv).rgb; // Last renders' values

    // THIS IS KINDA COOL
    // vec3 diff = color - prev;
    // diff *= nmask;
    // color = vec3(step(0.05, diff));
    // THESE LINES

    mixStrength *= energy;
  
  /* 
   * **** END ****
   * SPIRALING SDF RAYMARCH
   */

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