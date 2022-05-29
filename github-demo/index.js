/**
 * @type {import('overshader')}
 */
const { runWebglProgram } = Overshader;

runWebglProgram({
  canvasContainer: '.canvas1',
  fragmentShaderURL: '/assets/shaders/metaball.glsl',
  contextAttributes: {
    alpha: false,
    antialias: false,
  },
  //   textures: [
  //     "/assets/textures/texture-font.png",
  //     "/assets/textures/texture-noise.png",
  //   ],
  // lower resolution for Retina screen for better performance
  //   devicePixelRatio: 1,
});
