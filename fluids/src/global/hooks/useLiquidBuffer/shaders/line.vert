uniform vec2 uCellScale;

varying vec2 vUv;

void main(){
  vec3 pos = position;
  vUv = 0.5 + pos.xy * 0.5;

  vec2 n = sign(pos.xy);
  pos.xy = abs(pos.xy) - uCellScale * 2.0;
  pos.xy *= n;

  gl_Position = vec4(pos, 1.0);
}