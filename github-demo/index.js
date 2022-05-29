const rootBase =
  window.location.hostname === 'localhost' ? '' : 'https://overshom.github.io/overshader';

/**
 * @type {import('overshader')}
 */
const { runWebglProgram } = Overshader;

const gallery = document.querySelector('.gallery');

if (!gallery) {
  throw new Error('gallery not found');
}

let counter = 0;
/**
 *
 * @param {(selector: string) => void} cb
 */
const insideCanvas = cb => {
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
    fragmentShaderURL: `${rootBase}/assets/shaders/tubes.glsl`,
    textures: [`${rootBase}/assets/textures/texture-soil.jpeg`],
    // lower resolution for Retina screen for better performance
    devicePixelRatio: 1,
  });
});

insideCanvas(selector => {
  runWebglProgram({
    canvasContainer: selector,
    fragmentShaderURL: `${rootBase}/assets/shaders/glass.glsl`,
    contextAttributes: {
      alpha: false,
    },
  });
});

insideCanvas(selector => {
  runWebglProgram({
    canvasContainer: selector,
    fragmentShaderURL: `${rootBase}/assets/shaders/matrix.glsl`,
    textures: [
      `${rootBase}/assets/textures/texture-font.png`,
      `${rootBase}/assets/textures/texture-noise.png`,
    ],
    initialTimeShift: Math.random() * 1e3 * 1,
  });
});

insideCanvas(selector => {
  runWebglProgram({
    canvasContainer: selector,
    fragmentShaderURL: `${rootBase}/assets/shaders/metaball.glsl`,
  });
});

insideCanvas(selector => {
  runWebglProgram({
    canvasContainer: selector,
    fragmentShaderURL: `${rootBase}/assets/shaders/helix.glsl`,
    contextAttributes: {
      alpha: true,
      premultipliedAlpha: false,
    },
  });
});

insideCanvas(selector => {
  runWebglProgram({
    canvasContainer: selector,
    fragmentShaderURL: `${rootBase}/assets/shaders/debug.glsl`,
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
