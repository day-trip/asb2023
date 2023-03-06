import {defineConfig, splitVendorChunkPlugin} from 'vite';
import react from '@vitejs/plugin-react';


export default defineConfig({
    plugins: [
        react(),
        splitVendorChunkPlugin()
    ],
    server: {
        port: 5000,
        host: true
    }
})
