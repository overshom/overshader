#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

const float zoom = 39.752;

// chart function
// y = f(x)
float f(float x) {
    ///////
    x += u_time * 5.474;
    float y = sin(x * 0.192) * 9.;
    ///////
    return y;
}

// how many dots per chunk
const float freq = 0.980;
const float dotSize = clamp(0.164, .1, 1.);
// calibrate range when dot is cut (not rendered as full circle)
const float range = clamp(1.576, .1, 15.);

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
    float r = uv.x;
    uv.x *= u_resolution.x / u_resolution.y;

    vec3 col;
    float active = plotDot(uv);

    if(active > .0) {
        vec2 other = uv.yy;
        other *= 1. - r;
        col = vec3(r, other);
    } else {
        col = vec3(.3, 0.264, 0.242);
    }
    gl_FragColor = vec4(col, 1.0);
}
