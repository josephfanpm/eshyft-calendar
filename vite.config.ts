import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// `base` is set for GitHub Pages, where the app is served from /eshyft-calendar/.
export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/eshyft-calendar/' : '/',
  plugins: [react(), tailwindcss()],
  test: { environment: 'node' },
});
