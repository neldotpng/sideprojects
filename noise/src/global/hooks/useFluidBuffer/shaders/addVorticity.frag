#define EPSILON 0.00024414

uniform sampler2D uVelocity;
uniform sampler2D uVorticity;
uniform vec2 uCellScale;
uniform float uDeltaTime;
uniform float uStrength;

varying vec2 vUv;
varying vec2 pxL;
varying vec2 pxR;
varying vec2 pxB;
varying vec2 pxT;

void main() {
    float xL = texture2D(uVorticity, pxL).x;
    float xR = texture2D(uVorticity, pxR).x;
    float xB = texture2D(uVorticity, pxB).x;
    float xT = texture2D(uVorticity, pxT).x;
    float vorticity = texture2D(uVorticity, vUv).x;

    vec2 force = vec2(abs(xT) - abs(xB), abs(xR) - abs(xL)) / (2.0 * uCellScale);
    float mag_sq = max(EPSILON, dot(force, force));
    force *= inversesqrt(mag_sq);
    force *= uStrength * vorticity * vec2(1.0, -1.0);

    vec2 u = texture2D(uVelocity, vUv).xy;
    u += uDeltaTime * force;

    gl_FragColor = vec4(u, 0.0, 1.0);
}