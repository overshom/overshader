import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    outDir: './dist/',
    lib: {
      entry: 'src/main.ts',
      // global variable for UMD bundle
      name: 'Overshader',
      fileName: 'index',
    },
    sourcemap: true,
  },
  assetsInclude: ['shaders/*.glsl', 'textures/*'],
  plugins: [
    {
      name: 'reload-shaders',
      handleHotUpdate({ file, server }) {
        if (file.endsWith('.glsl')) {
          server.ws.send({
            type: 'full-reload',
            path: '*',
          });
        }
      },
    },
    dts(),
  ],
});
