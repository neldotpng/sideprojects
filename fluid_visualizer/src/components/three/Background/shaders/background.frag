uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform sampler2D uRaymarchTexture;
uniform sampler2D uTexture;
uniform float uPixelSize;
uniform float uFadeStrength;

varying vec2 vUv;

float remap(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

vec2 calcCellRes(vec2 _uv, vec2 _res, float _cellSize) {
  float aspect = _res.x / _res.y;

  float cellW = floor(_res.x * (1. / _cellSize));
  float cellsX = 1. / cellW;
  float cellH = cellW / aspect;
  float cellsY = 1. / cellH;

  return vec2(
    (floor(_uv.x / cellsX) + 0.5) * cellsX,
    (floor(_uv.y / cellsY) + 0.5) * cellsY
  );
}

void main() {
  vec3 color = vec3(0.);
  float aspect = uResolution.x / uResolution.y;
  vec2 uv = vUv;
  uv = (uv - 0.5) / vec2(1.0, aspect) + 0.5;
  vec2 _uv = calcCellRes(uv, uResolution, uPixelSize);

  vec4 fluidTex = texture2D(uTexture, _uv);

  float d = length(fluidTex.rg);
  color = 1. - vec3(d);
  color *= pow(d, uFadeStrength);

  gl_FragColor = vec4(color, 1.);
}