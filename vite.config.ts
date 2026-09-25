import { defineConfig } from 'vite';

export default defineConfig({
  // Relative asset paths, so the build works from any sub-path the host serves it at.
  base: './',
  // three.js alone is ~530 kB minified; that's expected, not a code-splitting problem.
  build: { chunkSizeWarningLimit: 1000 },
});
