import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteCommonjs } from '@originjs/vite-plugin-commonjs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),viteCommonjs()],
  server: {
    port: 3000
  },
  preview: {
    port: 3000
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  }
})
