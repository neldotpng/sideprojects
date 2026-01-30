uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform vec4 grassParams;
uniform vec4 fieldParams;
uniform sampler2D uTexture;

varying vec2 vUv;
varying vec3 vColor;
varying vec4 vGrassData;
varying vec3 vNormal;
varying vec3 vModelPos;

const vec3 BASE_COLOR = vec3(0.);
const vec3 TIP_COLOR = vec3(1.);

float inverseLerp(float v, float minValue, float maxValue) {
  return (v - minValue) / (maxValue - minValue);
}

float remap(float v, float inMin, float inMax, float outMin, float outMax) {
  float t = inverseLerp(v, inMin, inMax);
  return mix(outMin, outMax, t);
}

float saturate(float t) {
  return clamp(t, 0.0, 1.0);
}

// The MIT License
// Copyright © 2013 Inigo Quilez
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// https://www.youtube.com/c/InigoQuilez
// https://iquilezles.org/
//
// https://www.shadertoy.com/view/Xsl3Dl
vec3 hash(vec3 p) // replace this by something better
{
	p = vec3( dot(p,vec3(127.1,311.7, 74.7)),
            dot(p,vec3(269.5,183.3,246.1)),
            dot(p,vec3(113.5,271.9,124.6)));

	return -1.0 + 2.0*fract(sin(p)*43758.5453123);
}

mat3 rotateX(float radians) {
  float s = sin(radians);
  float c = cos(radians);

  return mat3(
    1., 0., 0.,
    0., c, s,
    0., -s, c
  );
}

mat3 rotateY(float radians) {
  float s = sin(radians);
  float c = cos(radians);

  return mat3(
    c, 0.0, s,
    0.0, 1.0, 0.0,
    -s, 0.0, c
  );
}

mat3 rotateZ(float radians) {
  float s = sin(radians);
  float c = cos(radians);

  return mat3(
    c, s, 0.,
    -s, c, 0.,
    0., 0., 1.
  );
}

mat3 rotateAxis(vec3 axis, float angle)
{
  float s = sin(angle);
  float c = cos(angle);
  float oc = 1.0 - c;
  
  return mat3(
    oc * axis.x * axis.x + c         ,  oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,
    oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c         ,  oc * axis.y * axis.z - axis.x * s,
    oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c
  );
}

vec2 quickHash(float p) {
  vec2 r = vec2(
    dot(vec2(p), vec2(17.43267, 23.8934543)),
    dot(vec2(p), vec2(13.98342, 37.2353234)));
  
  return fract(sin(r) * 1743.5482229);
}

float easeOut(float x, float t) {
  return 1. - pow(1. - x, t);
}

vec3 bezier(vec3 P0, vec3 P1, vec3 P2, vec3 P3, float t) {
  return (1. - t) * (1. - t) * (1. - t) * P0 +
         3. * (1. - t) * (1. - t) * t * P1 +
         3. * (1. - t) * t * t * P2 +
         t * t * t * P3;
}

// vec3 bezierGradient(vec3 P0, vec3 P1, vec3 P2, vec3 P3, float t) {
//   return 3. * (1. - t) * (1. - t) * (P1 - P0) +
//          6. * (1. - t) * t * (P2 - P1) +
//          3. * t * t * (P3 - P2);
// }

void main() {
  int GRASS_SEGMENTS = int(grassParams.x);
  int GRASS_VERTICES = (GRASS_SEGMENTS + 1) * 2;
  float GRASS_WIDTH = grassParams.z;
  float GRASS_HEIGHT = grassParams.w;
  float ROWS = fieldParams.x;
  float COLS = fieldParams.y;
  vec2 GRASS_PATCH_SIZE = fieldParams.zw;

  // GRASS OFFSET
  float id = float(gl_InstanceID);
  vec2 hashedInstanceID = quickHash(id) * 2. - 1.;
  vec3 grassOffset = vec3(
    floor(id / ROWS) / ROWS, 
    0.,
    -mod(id, COLS) / COLS
  ) * GRASS_PATCH_SIZE.xyy;
  vec2 randomOffset = hashedInstanceID * 0.1;
  grassOffset.xz += vec2(-GRASS_PATCH_SIZE.x / 2., GRASS_PATCH_SIZE.y / 2.) + randomOffset;

  // GRASS POSITION
  vec3 grassWorldPos = (modelMatrix * vec4(grassOffset, 1.)).xyz;
  vec3 hashVal = hash(grassWorldPos);

  // GRASS ROTATION
  const float PI = 3.14159;
  float angle = remap(hashVal.x, -1., 1., -PI, PI);
  // vec3 direction = cameraPosition - grassWorldPos;
  // direction = normalize(vec3(direction.x, 0., direction.z));
  // vec3 camDir = vec3(0., 0., 1.);

  // float ang = acos(dot(direction, camDir));

  // VERTEX ARRANGEMENT
  int vertFB_ID = gl_VertexID % (GRASS_VERTICES * 2);
  int vertID = vertFB_ID % GRASS_VERTICES;
  
  // VERTEX SIDE CALCULATION
  int xTest = vertID & 0x1;
  int zTest = (vertFB_ID >= GRASS_VERTICES) ? 1 : -1;
  float xSide = float(xTest);
  float zSide = float(zTest);
  float heightPercent = float(vertID - xTest) / (float(GRASS_SEGMENTS) * 2.);

  // GRASS SIZE
  float width = GRASS_WIDTH * easeOut(1. - heightPercent, 2.) * easeOut(heightPercent, 2.);
  float height = GRASS_HEIGHT;

  // CALCULATE VERTEX POSITIONS
  float x = (xSide - 0.5) * width;
  float y = heightPercent * height;
  float z = 0.;

  // BEZIER CURVE
  vec3 p1 = vec3(0.);
  vec3 p2 = vec3(0., 0.5, 0.);
  vec3 p3 = vec3(0., 0.75, 0.);
  vec3 p4 = vec3(0., 1., 0.);
  vec3 curve = bezier(p1, p2, p3, p4, heightPercent);

  y = curve.y * height;
  z = curve.z * height;

  // GENERATE POSITION
  vec3 grassLocalPosition = vec3(x, y, z) + grassOffset;
  vec4 modelPos = modelViewMatrix * vec4(grassLocalPosition, 1.);
  vec4 worldPosition = projectionMatrix * modelPos;

  // TEXTURE REFERENCE BY NDC
  vec3 ndc = worldPosition.xyz / worldPosition.w;
  vec2 _uv = ndc.xy * 0.5 + 0.5;
  vec4 tex = texture2D(uTexture, _uv);

  // WIND ANGLE AXIS
  vec3 windAxis = clamp(tex.yzx, -2., 2.);
  float windStrength = min(length(tex.rg) * length(windAxis), 2.);
  float windLeanAngle = windStrength * heightPercent * grassParams.y;

  // CALCULATE ROTATION AND RECALCULATE POSITION
  vec2 newUv = uv * 2. - 1.;
  mat3 grassMat = rotateX(newUv.y * 0.6) * rotateZ(newUv.x * 0.9) * rotateAxis(windAxis, windLeanAngle) * rotateY(angle);

  // RECALCULATE POSITIONS
  grassLocalPosition = grassMat * vec3(x, y, z) + grassOffset;
  modelPos = modelViewMatrix * vec4(grassLocalPosition, 1.);
  worldPosition = projectionMatrix * modelPos;

  gl_Position = worldPosition;

  // VARYINGS
  vColor = mix(BASE_COLOR, TIP_COLOR, heightPercent);
  vGrassData = vec4(x, heightPercent, xSide, 0.);
  vUv = _uv;
  vModelPos = modelPos.xyz;
}