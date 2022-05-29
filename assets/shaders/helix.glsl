#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

const float zoom = 50.040;

// chart function
// y = f(x)
float f(float x) {
    ///////
    x += u_time * .07150;
    float y = sin(x * 9.15) * 6.184;
    y *= abs(fract(x * .01) - .498) * 10.168;
    ///////
    return y;
}

// how many dots per chunk
const float freq = 4.468;
const float dotSize = clamp(0.132, .1, 1.000);
// calibrate range when dot is cut (not rendered as full circle)
const float range = clamp(3.496, .1, 15.);

float plotDot(vec2 pos) {
    // center position
    pos = pos * 2. - 1.;
    pos *= zoom;
    float x = pos.x;
    float ix = floor(x * freq) / freq;

    float len = 1.;
    for(float shift = -range; shift < range; shift++) {
        vec2 prev;
        prev.x = ix - shift / freq;
        prev.y = f(prev.x);
        float curLen = length((pos.xy - prev) * .2);
        len = min(len, curLen);
    }

    float active = 1. - step(dotSize, len);
    // active == 1. when pixel inside dot
    return active;
}

void main() {
    // uv for unit space [0, 1];
    vec2 uv = gl_FragCoord.xy / u_resolution;
    vec2 unit = uv;
    float r = uv.x + 0.000;
    uv.x *= u_resolution.x / u_resolution.y;
    uv.x += u_time * .150;

    vec3 col;
    float active = plotDot(uv);

    float op;

    if(active > .0) {
        op = 1. - abs(unit.x - .5) * 2.;
        op = smoothstep(.0, .2, op);
        col = vec3(r, smoothstep(.4, 1., 1. - r) * uv.yy);
    } else {
        col = vec3(.3, 0.264, 0.242);
    }
    gl_FragColor = vec4(col, op);
}
