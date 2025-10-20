import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    base: '/daily-record-template/',
    publicDir: 'public',
    build: {
        outDir: 'dist'
    },
    define: {
        global: 'globalThis',
    },
    optimizeDeps: {
        include: ['gray-matter']
    }
});
