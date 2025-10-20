import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react()
    ],
    base: '/daily-record/',
    publicDir: 'public',
    build: {
        outDir: 'dist',
        sourcemap: false,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'react-router-dom'],
                    charts: ['recharts'],
                    markdown: ['react-markdown', 'remark-gfm', 'rehype-raw', 'react-syntax-highlighter']
                }
            }
        }
    },
    define: {
        global: 'globalThis',
    },
    optimizeDeps: {
        include: ['gray-matter']
    }
});
