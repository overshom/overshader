# Overshader

Overshader is a simple library for building beatiful animations using WebGL Shaders.
This package built with TypeScript so you can explore all available options right in your IDE.

## [View Live Shaders Gallery Demo](https://overshom.github.io/overshader/github-demo/index.html)

![Shaders Gallery Demo](/docs/gallery-demo.png)

## Highlights

* Responsive out of the box
* No external dependencies
* Fully typed
* Small size (gzip ~ 3 KB)
* Few lines of code - and your shader is rendering in a browser
* Load textures by url
* Builtin uniforms for time, resolution and textures
* Explore shaders demos at [Demo Shaders](/assets/shaders)
* Convenient and fast standalone development via Vite
# Install

```sh
yarn add overshader
```

OR directly in HTML

```html
<script src="https://unpkg.com/overshader@1.0.3"></script>
```

OR as ES module

```html
<script type="module" async>
    import "https://unpkg.com/overshader@1.0.3";
    const {
        runWebglProgram
    } = Overshader;
    runWebglProgram({
        // ...
    });
</script>
```

## Verify it is working

Just provide CSS selector for canvas container

```ts
import { runWebglProgram } from 'overshader';

runWebglProgram({
    canvasContainer: '.responsive-canvas-container',
});
```

And you should see the default shader rendered inside specified container:

![Default Shader Demo](/docs/default-shader.png)

# Run your own shader

```ts
import { runWebglProgram } from 'overshader';

runWebglProgram({
    canvasContainer: '.responsive-canvas-container',
    // provide source as raw string
    fragmentShader: `precision highp float;
uniform vec2 u_resolution;
...`,
    // OR load source via URL
    fragmentShaderURL: 'path/to/fragment.glsl',
    // specify textures to use
    textures: ['/assets/textures/texture-font.png', '/assets/textures/texture-noise.png'],
    // control opacity and other WebGLContextAttributes
    contextAttributes: {
      alpha: true,
      premultipliedAlpha: false,
    },
    // randmoize time so every run looks different
    initialTimeShift: Math.random() * 1e3 * 1,
    // add event listeners to have u_mouse coordinates
    listenForMouse: true,
    // by default, devicePixelRatio = window.devicePixelRatio
    devicePixelRatio: 1,
    // react to first render
    onFirstRender(controls) {
        // e.g. update uniform
        controls.setUniform1f('u_value', 1.2323);
        // ...
    },
});
```

# Builtin uniforms

| Uniform                       | Type      | Meaning |
| ----------------------------- | --------- | - |
| u_resolution                  | vec2      | Resolution of canvas in pixels |
| u_time                        | float      | Time elapsed since start |
| u_mouse                       | vec2      | Coordinates of mouse |
| u_texture_${index}            | sampler2D | Texture by index from textures array |
| u_texture_resolution_${index} | vec2      | Texture resolution in pixels |

# Local development

```sh
git clone https://github.com/overshom/overshader.git

cd overshader

yarn

yarn dev
```
