export const createProgramFromSources = (
  gl: WebGLRenderingContext,
  shaderSources: string[],
  opt_attribs?: string[],
  opt_locations?: number[],
) => {
  const [vertex, fragment] = shaderSources;
  const vertexShader = loadShader(gl, vertex, gl.VERTEX_SHADER);
  const fragmentShader = loadShader(gl, fragment, gl.FRAGMENT_SHADER);
  const shaders: WebGLShader[] = [vertexShader, fragmentShader];
  return createProgram(gl, shaders, opt_attribs, opt_locations);
};

const createProgram = (
  gl: WebGLRenderingContext,
  shaders: WebGLShader[],
  opt_attribs?: string[],
  opt_locations?: number[],
) => {
  const program = gl.createProgram();
  if (!program) {
    throw new Error('cannot create gl program');
  }
  shaders.forEach(function (shader) {
    gl.attachShader(program, shader);
  });
  if (opt_attribs) {
    opt_attribs.forEach(function (attrib, ndx) {
      gl.bindAttribLocation(program, opt_locations ? opt_locations[ndx] : ndx, attrib);
    });
  }

  linkProgram(gl, program);

  return program;
};

export const linkProgram = (gl: WebGLRenderingContext, program: WebGLProgram) => {
  gl.linkProgram(program);

  const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!linked) {
    const lastError = gl.getProgramInfoLog(program);
    console.error('Error in program linking:' + lastError);

    gl.deleteProgram(program);
    throw new Error('gl program not linked');
  }
};

const loadShader = (
  gl: WebGLRenderingContext,
  shaderSource: string,
  shaderType: number,
): WebGLShader => {
  const shader = gl.createShader(shaderType);
  if (!shader) {
    throw new Error('cannot create gl shader');
  }

  compileShaderFromSource(gl, shader, shaderSource);

  return shader;
};

export const compileShaderFromSource = (
  gl: WebGLRenderingContext,
  shader: WebGLShader | null,
  shaderSource: string,
) => {
  if (!shader) {
    throw new Error('gl shader not provided');
  }

  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);

  // Check the compile status
  const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!compiled) {
    // Something went wrong during compilation; get the error
    const lastError = gl.getShaderInfoLog(shader);
    console.error(
      "*** Error compiling shader '" +
        shader +
        "':" +
        lastError +
        `\n` +
        shaderSource
          .split('\n')
          .map((l, i) => `${i + 1}: ${l}`)
          .join('\n'),
    );
    gl.deleteShader(shader);
    throw new Error('gl shader not compiled');
  }
};
