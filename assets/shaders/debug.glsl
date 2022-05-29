precision highp float;
uniform vec2 u_resolution;

const float DEBUG_LINE_WIDTH = .15;
const float UP = .5 + DEBUG_LINE_WIDTH * 1.5;
const float BOTTOM = .5 - DEBUG_LINE_WIDTH * 1.5;

const float TICK_WIDTH = .036;
const float HALF_TICK_WIDTH = TICK_WIDTH * .5;

float calcValue(float value, float x) {
    if(value == .0) {
        return .0;
    }
    if(value > .0 && x < .0) {
        return .0;
    }
    if(value < .0 && x > .0) {
        return .0;
    }
    return value > .0 ? step(x, value) : 1. - step(x, value);
}

vec3 debugValue(vec3 bg, vec3 value, vec2 st) {
    if(st.y < BOTTOM || st.y > UP) {
        return bg;
    }
    st.x -= .5;
    st.x *= 4.3;
    float m = fract(st.x + HALF_TICK_WIDTH);
    float tickColor = 1.;
    if(m < TICK_WIDTH) {
        tickColor = .7;
    }
    // red
    float val;
    vec3 col = bg;
    if(val > .0) {
        col = vec3(1.0, .0, .0);
    }
    if(st.y <= UP && st.y > UP - DEBUG_LINE_WIDTH) {
        // red
        val = calcValue(value.r, st.x);
        if(val > .0) {
            col = vec3(1.0, .0, .0);
        }
    } else if(st.y <= UP - DEBUG_LINE_WIDTH && st.y > BOTTOM + DEBUG_LINE_WIDTH) {
        // green
        val = calcValue(value.g, st.x);
        if(val > .0) {
            col = vec3(.0, 1.0, .0);
        }
    } else {
        // blue
        val = calcValue(value.b, st.x);
        if(val > .0) {
            col = vec3(.0, .0, 1.0);
        }
    }
    return col * tickColor;
}

uniform vec3 u_value;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    vec3 color = vec3(.9);

    // color = debugValue(color, vec3(1.383, -1.654, -1.090), uv);
    color = debugValue(color, u_value, uv);

    gl_FragColor = vec4(color, 1.0);
}
