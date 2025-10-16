import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const currentDir = fileURLToPath(new URL('.', import.meta.url));
const rootDir = resolve(currentDir, '..', '..');

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@theme-engine/core': resolve(rootDir, 'packages/theme-engine/src/index.ts'),
      '@markdown-pipeline/core': resolve(rootDir, 'packages/markdown-pipeline/src/index.ts'),
      '@ui/core': resolve(rootDir, 'packages/ui/src/index.tsx'),
      '@template-library/core': resolve(rootDir, 'packages/template-library/src/index.ts')
    }
  },
  server: {
    port: 5173
  }
});
