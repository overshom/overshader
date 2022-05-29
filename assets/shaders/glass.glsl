// this shader is an adjusted version of https://www.shadertoy.com/view/tslSzn

precision highp float;

uniform vec2 u_resolution;
uniform float u_time;

const float PI = 3.14;

mat2 rotate2d(float _angle) {
    return mat2(cos(_angle), -sin(_angle), sin(_angle), cos(_angle));
}

vec4 drawShape(vec2 uv, vec2 position, int sides, float size, vec3 color) {
	// Angle from current pixel
    uv = rotate2d((u_time * -.2) * 3.14) * uv;
    float a = atan(uv.x, uv.y) + PI;
    // radius from current pixel
    float r = 2.0 * PI / float(sides);
  	// modulate the distance

    float d = cos(floor(.5 + a / r) * r - a) * length(uv);
	//define the edges, and make smooth
    vec4 shape = vec4(1.0 - smoothstep(size, size + .08, d));
  	//color the shape
    shape.rgb *= color;
    return shape;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {   
	// normalize and adjust for aspect ratio
    vec2 res = u_resolution.xy, uv = (fragCoord * 2.0 - res) / res.y;
    uv = rotate2d(sin(u_time * .01) * 6.28) * uv;

    //initilize colors
    vec4 background = vec4(.2, .6, .9, 1.0);
    background *= -uv.y * .7 * cos(uv.x);
    vec4 color = vec4(1.0, .7, .3, 1.0);

    // set shape properties
    int sides = 3;
    float size = .5;
    vec2 position = vec2(0.0);
    vec4 shape = drawShape(uv, position, sides, size, color.rgb);

    // distance field
    float d = length(shape * 1.1) - .5;
    uv = rotate2d((u_time * .2) * 3.14) * uv;
    uv -= clamp(1.0 - d, 0.0, 1.0) * (cos(d - u_time * .5));

    //combine
    color *= vec4(.1 / length(mod(uv, 1.0) - .5));
    background *= shape * 2.0 - d - shape * cos(uv.y) * 1.5;

	//output final color
    fragColor = mix(background, color, color.a);
}

void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}