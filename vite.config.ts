import {defineConfig, splitVendorChunkPlugin} from 'vite';
import react from '@vitejs/plugin-react';


export default defineConfig({
    plugins: [
        react(),
        splitVendorChunkPlugin()
    ],
    resolve: {
        alias: [
            { find: './runtimeConfig', replacement: './runtimeConfig.browser' },
            { find: '@', replacement: '/src' }
        ],
    },
    server: {
        port: 5000,
        host: true
    }
})
