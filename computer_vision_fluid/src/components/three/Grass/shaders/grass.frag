uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform sampler2D uTexture;

varying vec3 vColor;
varying vec4 vGrassData;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vModelPos;

vec3 pal( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d )
{
    return a + b*cos( 6.28318*(c*t+d) );
}


void main() {
  vec2 uv = vUv;

  vec4 tex = texture2D(uTexture, uv);
  float alpha = pow(length(tex.rg), 2.);
  alpha = min(alpha, 0.33);
  vec3 color = vColor;

  vec3 palette = pal(
    pow(length(tex.rg) * 2.5, 0.5), 
    vec3(0.7 , 0.6 , 0.5 ),
    vec3(0.5 , 0.5 , 0.5 ),
    vec3(1.0 , 1.0 , 1.0 ),
    vec3(0.5 , 0.2 , 2.0 ) 
  );
  color *= palette;

  gl_FragColor = vec4(color, alpha);
}