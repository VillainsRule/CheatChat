import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],

    resolve: {
        alias: {
            '@components': '/src/components',
            '@styles': '/src/styles',
            '@utils': '/src/utils'
        }
    },
    
    server: {
        port: 2222,

        proxy: {
            '/api': {
                target: 'http://localhost:22222',
                changeOrigin: true,
                ws: true
            },
            '/ws': {
                target: 'http://localhost:22222',
                changeOrigin: true,
                ws: true
            }
        },

        mimeTypes: {
            '.module.css': 'text/css'
        }
    },

    css: {
        modules: {
            scopeBehaviour: 'local',
            generateScopedName: '[hash:8]',
        }
    },

    build: {
        target: 'es2022',
        outDir: '../backend/public',
        rollupOptions: {
            output: {
                manualChunks: (id) => {
                    if (id.includes('node_modules')) return 'vendor';
                    else return 'main';
                },
                chunkFileNames: '[hash].js',
                entryFileNames: '[hash].js',
                assetFileNames: '[hash].[ext]',
            },
        },
        chunkSizeWarningLimit: 1000,
        manifest: true
    }
});