precision highp float;

uniform vec2 u_resolution;
uniform float u_time;

vec2 random2(vec2 p) {
    return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
}

vec3 metaballs(vec2 st) {
    vec3 color = vec3(.0);

    // Tile the space
    vec2 i_st = floor(st);
    vec2 f_st = fract(st);

    float m_dist = 1.;  // minimum distance

    for(int y = -1; y <= 1; y++) {
        for(int x = -1; x <= 1; x++) {
            // Neighbor place in the grid
            vec2 neighbor = vec2(float(x), float(y));

            // Random position from current + neighbor place in the grid
            vec2 point = random2(i_st + neighbor);

			// Animate the point
            point = 0.5 + 0.5 * sin(u_time + 6.2831 * point);

			// Vector between the pixel and the point
            vec2 diff = neighbor + point - f_st;

            // Distance to the point
            float dist = length(diff);

            // Keep the closer distance
            m_dist = min(m_dist, dist * m_dist);
        }
    }

    // Draw the min distance (distance field)
    color += m_dist;

    // Draw cell center
    color += 1. - smoothstep(.24, .25, m_dist);

    // Draw grid
    // color.r += step(.98, f_st.x) + step(.98, f_st.y);

    return color;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    // vec3 col = text(fragCoord) * rain(fragCoord);
    vec3 col = vec3(.5, .9, .5);
    vec2 uv = fragCoord / u_resolution;
    uv.x *= u_resolution.x / u_resolution.y;
    vec3 noise = metaballs(uv * 6.);
    col *= noise;
    fragColor = vec4(col, 1.);
}

void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}