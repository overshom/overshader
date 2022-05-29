precision highp float;

uniform vec2 u_resolution;
uniform float u_time;

uniform sampler2D u_texture_0;
uniform sampler2D u_texture_1;
uniform vec2 u_texture_resolution_1;

// less number makes char bigger
const float CHAR_SCALE = .8;

float text(vec2 coord) {
    coord *= CHAR_SCALE;
    vec2 uv = mod(coord.xy, 16.) * .0625;
    vec2 block = coord * .0625 - uv;
    uv = uv * .8 + .1; // scale the letters up a bit
    uv += floor(texture2D(u_texture_1, block / u_texture_resolution_1.xy + u_time * .0004).xy * 16.); // randomize letters
    uv *= .0625; // bring back into 0-1 range
    uv.x = -uv.x; // flip letters horizontally
    return texture2D(u_texture_0, uv).r;
}

vec3 rain(vec2 coord) {
    // calc pos before coord rescale
    vec2 pos = coord / u_resolution;
    coord *= CHAR_SCALE;
    coord.x -= mod(coord.x, 16.);
    // coord.y -= mod(coord.y, 16.);

    float offset = sin(coord.x * .5);
    float speed = cos(coord.x * 34.5) * .53 + .7;

    float y = fract(pos.y + u_time * speed * .11 + offset);
    vec3 maybeBlueCol = vec3(.1, .5, 1.) * step(.5, pos.y);
    vec3 maybeYellowCol = vec3(.9, .9, .1) * (1. - step(.5, pos.y));
    return (maybeBlueCol + maybeYellowCol) / (y * 13.);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec3 col = text(fragCoord) * rain(fragCoord);
    fragColor = vec4(col, 1.);
}

void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}