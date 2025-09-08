import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    css: {
        modules: {
            // Hiển thị tên class rõ ràng hơn khi phát triển
            generateScopedName: '[name]__[local]___[hash:base64:5]',
        },
    },
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
                secure: false,
            },
        },
    },
});
