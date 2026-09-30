import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 8080,
    host: true, // Listen on all network interfaces
  },
  preview: {
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 8080,
    host: true,
  }
});
