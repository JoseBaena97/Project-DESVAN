import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    // El .env vive en la raíz del monorepo (lo comparte con Flask)
    envDir: '../../',
    server: {
        port: 3000
    },
    build: {
        outDir: 'dist'
    }
})
