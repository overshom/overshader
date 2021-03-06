import { runWebglProgram } from '../src/run-program';

const gallery = document.querySelector('.gallery');

if (!gallery) {
  throw new Error('gallery not found');
}

let counter = 0;
const insideCanvas = (cb: (selector: string) => void) => {
  const className = `canvas${++counter}`;
  const div = document.createElement('div');
  div.onclick = () => div.requestFullscreen();
  div.classList.add(className);
  gallery.appendChild(div);
  cb(`.${className}`);
};

insideCanvas(selector => {
  runWebglProgram({
    canvasContainer: selector,
    fragmentShaderURL: '/assets/shaders/tubes.glsl',
    textures: ['/assets/textures/texture-soil.jpeg'],
    // lower resolution for Retina screen for better performance
    devicePixelRatio: 1,
  });
});

insideCanvas(selector => {
  runWebglProgram({
    canvasContainer: selector,
    fragmentShaderURL: '/assets/shaders/glass.glsl',
    contextAttributes: {
      alpha: false,
    },
  });
});

insideCanvas(selector => {
  runWebglProgram({
    canvasContainer: selector,
    fragmentShaderURL: '/assets/shaders/matrix.glsl',
    textures: ['/assets/textures/texture-font.png', '/assets/textures/texture-noise.png'],
    initialTimeShift: Math.random() * 1e3 * 1,
  });
});

insideCanvas(selector => {
  runWebglProgram({
    canvasContainer: selector,
    fragmentShaderURL: '/assets/shaders/metaball.glsl',
  });
});

insideCanvas(selector => {
  runWebglProgram({
    canvasContainer: selector,
    fragmentShaderURL: '/assets/shaders/helix.glsl',
    contextAttributes: {
      alpha: true,
      premultipliedAlpha: false,
    },
  });
});

insideCanvas(selector => {
  runWebglProgram({
    canvasContainer: selector,
    fragmentShaderURL: '/assets/shaders/debug.glsl',
    onFirstRender(controls) {
      const upd = () => {
        controls.setUniform3fv('u_value', [
          Math.random() * 4 - 2,
          Math.random() * 4 - 2,
          Math.random() * 4 - 2,
        ]);
      };
      setInterval(upd, 500);
      upd();
    },
  });
});
