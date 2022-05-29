import { IS_DEV_ENV } from '../src/env';
import { runWebglProgram } from '../src/run-program';

const runDefaultProgram = () => {
  const controls = runWebglProgram({
    canvasContainer: '.webgl-canvas-container',
    fragmentShaderURL: '/assets/shaders/matrix.glsl',
    textures: ['/assets/textures/texture-font.png', '/assets/textures/texture-noise.png'],
    initialTimeShift: Math.random() * 1e3 * 1,
  });

  if (IS_DEV_ENV) {
    setupControls(controls);
    // expose controls for debugging in the console
    (window as any).controls = controls;
  }

  return controls;
};

const setupControls = (controls: ReturnType<typeof runDefaultProgram>) => {
  const container = document.createElement('div');
  container.classList.add('programControls');
  controls.parentElement.append(container);

  const addButton = (name: string, onClick: () => void) => {
    const button = document.createElement('button');
    button.textContent = name;
    button.onclick = onClick;
    container.append(button);
  };

  addButton('play', controls.play);
  addButton('stop', controls.stop);
};

runDefaultProgram();
