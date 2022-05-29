import { handleCanvasResize } from './canvas.utils';
import { compileShaderFromSource, createProgramFromSources, linkProgram } from './gl.utils';

interface IChannel {
  location: WebGLUniformLocation | null;
  name: string;
  index: number;
  loaded: boolean;
}

type ArgsWithoutFirst<F> = F extends (first: any, ...other: infer args) => void ? args : never;

const defaultVertexShader = `
// an attribute will receive data from a buffer
attribute vec4 a_position;

// all shaders have a main function
void main() {
  // gl_Position is a special variable a vertex shader
  // is responsible for setting
  gl_Position = a_position;
}
`;

const defaultFragmentShader = `
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;

void main() {
  vec2 pos = gl_FragCoord.xy / u_resolution.xy;
  gl_FragColor = vec4(pos.xy, sin(u_time) * .5 + 1., 1.);
}`;

const defaultAsyncFragmentShader = `
precision highp float;

void main() {
  gl_FragColor = vec4(0.);
}`;

const BUILTIN_UNIFORMS = {
  resolution: 'u_resolution',
  time: 'u_time',
  mouse: 'u_mouse',
};

const fetchSource = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`source not loaded: ${url}`);
  }
  return res.text();
};

export interface ProgramControls {
  play: () => void;
  stop: () => void;
  parentElement: HTMLElement;
  setUniform1f: (uniformName: string, x: number) => WebGLUniformLocation | null;
  setUniform1i: (uniformName: string, x: number) => WebGLUniformLocation | null;
  setUniform2f: (uniformName: string, x: number, y: number) => WebGLUniformLocation | null;
  setUniform2i: (uniformName: string, x: number, y: number) => WebGLUniformLocation | null;
  setUniform3f: (
    uniformName: string,
    x: number,
    y: number,
    z: number,
  ) => WebGLUniformLocation | null;
  setUniform3i: (
    uniformName: string,
    x: number,
    y: number,
    z: number,
  ) => WebGLUniformLocation | null;
  setUniform4f: (
    uniformName: string,
    x: number,
    y: number,
    z: number,
    w: number,
  ) => WebGLUniformLocation | null;
  setUniform4i: (
    uniformName: string,
    x: number,
    y: number,
    z: number,
    w: number,
  ) => WebGLUniformLocation | null;
  setUniform1fv: (uniformName: string, v: Float32List) => WebGLUniformLocation | null;
  setUniform1iv: (uniformName: string, v: Int32List) => WebGLUniformLocation | null;
  setUniform2fv: (uniformName: string, v: Float32List) => WebGLUniformLocation | null;
  setUniform2iv: (uniformName: string, v: Int32List) => WebGLUniformLocation | null;
  setUniform3fv: (uniformName: string, v: Float32List) => WebGLUniformLocation | null;
  setUniform3iv: (uniformName: string, v: Int32List) => WebGLUniformLocation | null;
  setUniform4fv: (uniformName: string, v: Float32List) => WebGLUniformLocation | null;
  setUniform4iv: (uniformName: string, v: Int32List) => WebGLUniformLocation | null;
  setUniformMatrix2fv: (
    uniformName: string,
    transpose: boolean,
    value: Float32List,
  ) => WebGLUniformLocation | null;
  setUniformMatrix3fv: (
    uniformName: string,
    transpose: boolean,
    value: Float32List,
  ) => WebGLUniformLocation | null;
  setUniformMatrix4fv: (
    uniformName: string,
    transpose: boolean,
    value: Float32List,
  ) => WebGLUniformLocation | null;
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  replaceFragmentShader: (newShaderSource: string) => void;
  canvas: HTMLCanvasElement;
}

export const runWebglProgram = ({
  canvasContainer: canvasContainerOrSelector,
  fragmentShader = defaultFragmentShader,
  vertexShader = defaultVertexShader,
  fragmentShaderURL,
  textures,
  devicePixelRatio = window.devicePixelRatio,
  listenForMouse = false,
  waitForTexturesLoad = false,
  initialTimeShift = 0,
  autoplay = true,
  contextAttributes,
  onFirstRender,
}: {
  canvasContainer: HTMLElement | string;
  fragmentShader?: string;
  vertexShader?: string;
  fragmentShaderURL?: string;
  textures?: string[];
  devicePixelRatio?: number;
  listenForMouse?: boolean;
  waitForTexturesLoad?: boolean;
  //  e.g. Math.random() * 1e3 to make time-dependent rendering look different each run
  initialTimeShift?: number;
  autoplay?: boolean;
  contextAttributes?: WebGLContextAttributes;
  onFirstRender?: (controls: ProgramControls) => void;
  // TODO
  // texturesCache?: Record<stringUrl, Image>; // to not load image again
}): ProgramControls => {
  if (fragmentShaderURL) {
    if (fragmentShader === defaultFragmentShader) {
      fragmentShader = defaultAsyncFragmentShader;
    }
  }
  const canvas = document.createElement('canvas');

  const parentElement =
    typeof canvasContainerOrSelector === 'string'
      ? document.querySelector(canvasContainerOrSelector)
      : canvasContainerOrSelector;
  if (!parentElement || !(parentElement instanceof HTMLElement)) {
    console.error('invalid canvas container element', parentElement, canvasContainerOrSelector);
    throw new Error('canvas container for webgl not found');
  }
  parentElement.appendChild(canvas);
  handleCanvasResize(canvas, parentElement, devicePixelRatio);
  const gl = canvas.getContext('webgl', contextAttributes);
  if (!gl) {
    throw new Error('no gl context available');
  }

  // setup GLSL program
  const program = createProgramFromSources(gl, [vertexShader, fragmentShader]);

  if (!program) {
    throw new Error('gl program not created');
  }

  // use our program right away
  gl.useProgram(program);

  // look up where the vertex data needs to go.
  const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');

  const buildUniformSetter = <F extends (...allArgs: any[]) => void>(method: F) => {
    return (uniformName: string, ...args: ArgsWithoutFirst<F>) => {
      const location = gl.getUniformLocation(program, uniformName);
      if (!location) {
        return location;
      }
      method(location, ...args);
      return location;
    };
  };

  const setUniform1f = buildUniformSetter(gl.uniform1f.bind(gl));
  const setUniform1i = buildUniformSetter(gl.uniform1i.bind(gl));
  const setUniform2f = buildUniformSetter(gl.uniform2f.bind(gl));
  const setUniform2i = buildUniformSetter(gl.uniform2i.bind(gl));
  const setUniform3f = buildUniformSetter(gl.uniform3f.bind(gl));
  const setUniform3i = buildUniformSetter(gl.uniform3i.bind(gl));
  const setUniform4f = buildUniformSetter(gl.uniform4f.bind(gl));
  const setUniform4i = buildUniformSetter(gl.uniform4i.bind(gl));
  const setUniform1fv = buildUniformSetter(gl.uniform1fv.bind(gl));
  const setUniform1iv = buildUniformSetter(gl.uniform1iv.bind(gl));
  const setUniform2fv = buildUniformSetter(gl.uniform2fv.bind(gl));
  const setUniform2iv = buildUniformSetter(gl.uniform2iv.bind(gl));
  const setUniform3fv = buildUniformSetter(gl.uniform3fv.bind(gl));
  const setUniform3iv = buildUniformSetter(gl.uniform3iv.bind(gl));
  const setUniform4fv = buildUniformSetter(gl.uniform4fv.bind(gl));
  const setUniform4iv = buildUniformSetter(gl.uniform4iv.bind(gl));
  const setUniformMatrix2fv = buildUniformSetter(gl.uniformMatrix2fv.bind(gl));
  const setUniformMatrix3fv = buildUniformSetter(gl.uniformMatrix3fv.bind(gl));
  const setUniformMatrix4fv = buildUniformSetter(gl.uniformMatrix4fv.bind(gl));

  // Create a buffer to put three 2d clip space points in
  const positionBuffer = gl.createBuffer();

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // fill it with a 2 triangles that cover clipspace
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      -1,
      -1, // first triangle
      1,
      -1,
      -1,
      1,
      -1,
      1, // second triangle
      1,
      -1,
      1,
      1,
    ]),
    gl.STATIC_DRAW,
  );

  // ------------- texture
  const buildGenerator =
    (i = 0) =>
    () =>
      i++;
  const generateIndex = buildGenerator();
  const allTextures: IChannel[] = [];

  const generateChannel = (name: string, isTexture: boolean) => {
    const index = generateIndex();
    const location = gl.getUniformLocation(program, name);
    const channel: IChannel = {
      // location is null when not referenced inside shader
      location,
      name,
      index,
      loaded: false,
    };
    if (isTexture) {
      allTextures.push(channel);
    }
    return channel;
  };

  let isPlayMode = autoplay;
  let areAllTexturesLoaded = true;
  let play = () => {};

  const checkAllTexturesLoaded = () => {
    areAllTexturesLoaded = allTextures.every(e => e.loaded);
  };

  const onSharedsReady = () => {
    const loadChannel = (src: string, index: number) => {
      const channel = generateChannel(`u_texture_${index}`, true);
      const resolution = generateChannel(`u_texture_resolution_${index}`, false);
      checkAllTexturesLoaded();

      if (!channel.location) {
        // mark as loaded so we don't block rendering
        channel.loaded = true;
        checkAllTexturesLoaded();
        console.info('channel location not created', src);
        return;
      }

      // Create a texture.
      const texture = gl.createTexture();
      if (!texture) {
        console.info('channel texture not created', src);
        return;
      }
      gl.activeTexture(gl.TEXTURE0 + channel.index);
      gl.bindTexture(gl.TEXTURE_2D, texture);

      // Fill the texture with a 1x1 blue pixel.
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        1,
        1,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        new Uint8Array([0, 0, 255, 255]),
      );

      // Asynchronously load an image
      const image = new Image();
      image.src = src;
      image.addEventListener('load', function () {
        channel.loaded = true;
        checkAllTexturesLoaded();
        // Now that the image has loaded make copy it to the texture.
        gl.activeTexture(gl.TEXTURE0 + channel.index);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
        setUniform2f(resolution.name, image.width, image.height);
      });
    };

    textures?.forEach((url, index) => {
      loadChannel(url, index);
    });
    // ------------- end texture

    let mouseX = 0;
    let mouseY = 0;

    const setMousePosition = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX * devicePixelRatio - rect.left;
      mouseY = (rect.height - (e.clientY - rect.top)) * devicePixelRatio - 1; // bottom is 0 in WebGL
      // console.log(mouseX, mouseY);
    };

    if (listenForMouse) {
      canvas.addEventListener('mousemove', setMousePosition);
      canvas.addEventListener(
        'touchstart',
        e => {
          e.preventDefault();
        },
        { passive: false },
      );
      canvas.addEventListener(
        'touchmove',
        (e: any) => {
          e.preventDefault();
          setMousePosition(e.touches[0]);
        },
        { passive: false },
      );
      canvas.addEventListener(
        'touchend',
        e => {
          e.preventDefault();
        },
        { passive: false },
      );
    }

    let then = 0;
    let time = 0 + initialTimeShift;

    const render = (now: number, firstRender?: boolean) => {
      if (!isPlayMode && !firstRender) {
        return;
      }
      if (waitForTexturesLoad && !areAllTexturesLoaded) {
        requestAnimationFrame(time => render(time, firstRender));
        return;
      }
      if (firstRender) {
        onFirstRender?.(controls);
      }

      now *= 0.001; // convert to seconds
      const elapsedTime = Math.min(now - then, 0.1);
      time += elapsedTime;
      then = now;

      // Tell WebGL how to convert from clip space to pixels
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      // Make sure we use our program (pair of shaders)
      gl.useProgram(program);

      // Turn on the attribute
      gl.enableVertexAttribArray(positionAttributeLocation);

      // Bind the position buffer.
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

      // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
      gl.vertexAttribPointer(
        positionAttributeLocation,
        2, // 2 components per iteration
        gl.FLOAT, // the data is 32bit floats
        false, // don't normalize the data
        0, // 0 = move forward size * sizeof(type) each iteration to get the next position
        0, // start at the beginning of the buffer
      );

      setUniform2f(BUILTIN_UNIFORMS.resolution, gl.canvas.width, gl.canvas.height);
      setUniform1f(BUILTIN_UNIFORMS.time, time);
      if (listenForMouse) {
        setUniform2f(BUILTIN_UNIFORMS.mouse, mouseX, mouseY);
      }

      allTextures.forEach(e => {
        setUniform1i(e.name, e.index);
      });

      gl.drawArrays(
        gl.TRIANGLES,
        0, // offset
        6, // num vertices to process
      );

      requestAnimationFrame(render);
    };

    requestAnimationFrame(time => render(time, true));

    play = () => {
      if (isPlayMode) {
        return;
      }
      isPlayMode = true;
      requestAnimationFrame(render);
    };
  };

  const replaceFragmentShader = (newShaderSource: string) => {
    const [, shader] = gl.getAttachedShaders(program) || [];
    compileShaderFromSource(gl, shader, newShaderSource);
    linkProgram(gl, program);
  };

  if (fragmentShaderURL) {
    fetchSource(fragmentShaderURL).then(source => {
      replaceFragmentShader(source);
      onSharedsReady();
    });
  } else {
    onSharedsReady();
  }

  const controls: ProgramControls = {
    // call play in wrap to keep the reference to mutated variable
    play: () => play(),
    stop: () => {
      isPlayMode = false;
    },
    parentElement,
    setUniform1f,
    setUniform1i,
    setUniform2f,
    setUniform2i,
    setUniform3f,
    setUniform3i,
    setUniform4f,
    setUniform4i,
    setUniform1fv,
    setUniform1iv,
    setUniform2fv,
    setUniform2iv,
    setUniform3fv,
    setUniform3iv,
    setUniform4fv,
    setUniform4iv,
    setUniformMatrix2fv,
    setUniformMatrix3fv,
    setUniformMatrix4fv,
    gl,
    program,
    replaceFragmentShader,
    canvas,
  };

  return controls;
};
