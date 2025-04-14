uniform float uTime;
uniform vec2 uMouse;
uniform sampler2D uTexture;
uniform sampler2D uFFTTexture;

varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  // uv = fract(uv * 2.);
  float time = uTime * 0.5;
  vec3 color = vec3(0.);

  vec4 prev = texture2D(uTexture, vUv + 0.005);
  float f = texture2D(uFFTTexture, uv).r;
  float s = step( uv.y, f ) * step( f - 0.125, uv.y );

  // Audio-reactive color
  color = mix(
    prev.rgb, 
    vec3(s + 0.4 * sin(time * 1.13), s + 0.3 * sin(time * 1.23), s + 0.5 * sin(time * 1.33)), 
    0.1
  );
  color *= 0.98; // fade
  // color *= vec3(vUv * 2. - 1., 1.);
  // color = vec3(uBass, uMids, uHighs);

  gl_FragColor = vec4(color, 1.);

  // gl_FragColor = vec4(uv, 1., 1.);
}