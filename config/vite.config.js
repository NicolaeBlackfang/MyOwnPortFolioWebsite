import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const siteRoot = resolve(projectRoot, 'site');

export default defineConfig({
  root: siteRoot,
  envDir: projectRoot,
  plugins: [react()],
  build: {
    outDir: resolve(projectRoot, 'netlify-ready'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(siteRoot, 'index.html'),
        admin: resolve(siteRoot, 'admin/index.html'),
        inspectError: resolve(siteRoot, 'inspecterror.html'),
      },
    },
  },
});
