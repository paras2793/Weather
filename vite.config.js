
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    proxy: {
      '/api/cities': {
        target: 'https://api.cityapi.org',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/cities/, '/v1/cities'),
      },
    },
  },
})
