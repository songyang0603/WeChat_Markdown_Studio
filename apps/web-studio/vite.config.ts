import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const currentDir = fileURLToPath(new URL('.', import.meta.url));
const rootDir = resolve(currentDir, '..', '..');

export default defineConfig({
  // 👇 如果你的仓库名是 my-repo,则设置为 '/my-repo/'
  base: process.env.GITHUB_PAGES ? '/WeChat_Markdown_Studio/' : '/',
  
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
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
