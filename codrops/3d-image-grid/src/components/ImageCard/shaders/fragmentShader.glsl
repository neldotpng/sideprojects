uniform sampler2DArray uTexArray;

varying vec2 vUv;
varying float vIndex;
varying float vDist;

vec3 getLuminance(vec3 color) {
  vec3 luminance = vec3(0.2126, 0.7152, 0.0722);
  return vec3(dot(luminance, color));
}

void main() {
  vec2 uv = vUv;
  vec4 image = texture(uTexArray, vec3(uv, vIndex));
  
  vec3 imageLum = getLuminance(image.xyz);
  vec3 color = mix(imageLum, image.xyz, vDist);
  // color = vec3(uv, 1.);
  
  gl_FragColor = vec4(color, 1.);
}