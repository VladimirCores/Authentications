// vite.config.js
/** @type {import('vite').UserConfig} */
import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig({
  // omit
  plugins: [mkcert()],
  server: {
    port: 8087,
    cors: true,
    host: 'local.dev',
    https: true,
  },
});
