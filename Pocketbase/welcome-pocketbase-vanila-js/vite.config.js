// vite.config.js
/** @type {import('vite').UserConfig} */
import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';
import eslint from 'vite-plugin-eslint';
import dns from 'dns';

dns.setDefaultResultOrder('verbatim');

export default defineConfig({
  // omit
  plugins: [mkcert(), eslint()],
  server: {
    port: 8089,
    cors: true,
    host: 'local.dev',
    https: true,
  },
});
