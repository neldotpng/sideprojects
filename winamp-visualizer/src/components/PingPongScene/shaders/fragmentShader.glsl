uniform float uTime;
uniform vec2 uMouse;
uniform sampler2D uTexture;

varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  vec4 tex = texture2D(uTexture, vUv + 0.005);
  // tex.rgb *= 0.97; // fade out
  // tex.rgb += 0.03 * vec3(sin(uTime + uv.x * 10.0), cos(uTime + uv.y * 10.0), 0.5);

  // vec3 color = vec3(vUv - .5, 1.);
  vec3 color = mix(tex.rgb, vec3((uv.x + 0.05 )* 5.0, sin(uTime), cos(uTime * 0.5)), 0.1);
  color *= 0.98;

  gl_FragColor = vec4(color, 1.);
  // gl_FragColor = tex;
  // gl_FragColor = vec4(tex.rgb * 0.98 + color * 0.01, 1.0);
}